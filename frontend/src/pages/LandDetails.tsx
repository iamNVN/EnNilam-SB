
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, DollarSign, User, Calendar, ArrowLeft, LocateFixed, LandPlot, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import MapComponent from "@/components/Map";
import { Button } from "@/components/ui/button";

interface UserPayload extends JwtPayload {
  aadhaar?: string;
  name?: string;
  id?: string;
  phone?: number;
}

// Interface for the location object
interface Location {
  type: string;
  crs: {
    type: string;
    properties: { name: string };
  };
  coordinates: [number, number];
}

// Interface for owner history
interface OwnerHistory {
  date: string;
  owner: string;
  name: string;
}
interface OwnerName {
  name: string;
}
// Interface for land details
interface LandDetails {
  landid: string;
  owner: string;
  location: Location;
  ownerName: OwnerName;
  areaInSqft: number;
  areaInCent: number;
  city: string;
  state: string;
  ownerhistory: OwnerHistory[];
}

interface Offer {
  amount: number;
  date: string;
}
// Interface for the main listing object
interface Listing {
  id: string;
  landid: string;
  rate_per_cent: number;
  type: string;
  offers: Offer[] | null,
  auction_end_time: string | null;
  starting_bid: number | null;
  listed_on: string;
  landDetails: LandDetails;
}


const LandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // const listing = mockListings.find((l) => l.id === id);
  const [listing, setListing] = useState<Listing | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [hasMadeOffer, setMadeOffer] = useState(null);
  const [cancelBtnText, setCancelText] = useState("Cancel");
  const [submitBtnText, setSubmitBtn] = useState("Submit Offer");
  const [userOffer, setUserOffers] = useState<{
    
    offerAmount: number;
    date: string;
  } | null>(null);

  const session = localStorage.getItem("wallet");


  const [open, setOpen] = useState(false);
  const [openBuy, setOpenBuy] = useState(false);
  const [paymentProceeded,setPayProceed] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  function formatDate(dateInput: string | number | Date, time: boolean) {
    // Convert Unix timestamp (in seconds) to milliseconds
    const date = typeof dateInput === 'number'
      ? new Date(dateInput * 1000)
      : new Date(dateInput);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateInput);
      return "Invalid Date";
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format and handle 0 as 12
    const dateee = `${day}-${month}-${year}`;
    const timeee = `${hours}:${minutes} ${ampm}`;
    return time ? dateee + " " + timeee : dateee;
  }

  useEffect(() => {
    const fetchData = async () => {

      if (!session) {
        navigate(`/login?redirect=${location.pathname}`);
        return;
      }

      try {
        // 🛠️ Fetch Listing Details
        const listingResponse = await fetch("http://localhost:5000/getlisting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: session, listingID: id }),
          credentials: "include",
        });

        const listingData = await listingResponse.json();


        if (!listingResponse.ok || !listingData.success) {
          throw new Error(listingData.error);
        }

        if (listingData.data.type === "auction") {
          setOfferAmount(listingData.data.starting_bid);
        }

        setListing(listingData.data); // ✅ Set Listing Data


        // 🛠️ Fetch Offers for the Listing
        const offersResponse = await fetch("http://localhost:5000/listingOffer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id, wallet: session }),
        });

        const offersData = await offersResponse.json();

        if (offersData.success && offersData.offer) {
          setMadeOffer(true);
          setUserOffers(offersData.offer);
          setOfferAmount(offersData.offer.offerAmount);
        } else if (offersData.success && !offersData.offer) {
          setMadeOffer(false);
        } else {
          setMadeOffer(false);
          toast.error(offersData.message);
        }
      } catch (error: any) {
        setMadeOffer(false);
        toast.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, id, navigate, location]);

  if (!isLoading && !listing) {
    return <div className="min-h-screen bg-dark-200 flex items-center justify-center text-white">Land not found</div>;
  }

  const buyLand = async () => {
    if (!listing) return;

    try {
      setPayProceed(true);
      // Create an order on the server
      const response = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session, listingID: listing.id }),
      });

      const { order, key } = await response.json();

      if (!order) {
        toast.error("Failed to create payment order. Please try again.");
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key, // Razorpay API Key
        amount: order.amount,
        currency: order.currency,
        name: "Land Purchase",
        description: `Buying Land ID: ${+listing.landDetails.city}, ${listing.landDetails.state}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment on the server
            const verifyResponse = await fetch("http://localhost:5000/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                wallet: session,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast.success("Payment successful! Land purchased.");
              navigate("/myLands");
            } else {
              toast.error("Payment failed. Please contact support.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Payment verification failed.");
          }
        },
      

        theme: {
          color: "#9B87F5",
        },
        method: {
          netbanking: true,
          card: true, // Enables both Credit & Debit Cards
          upi: true,
          wallet: true, // Enables all wallets
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [
                  { method: "upi" },
                  { method: "gpay" },
                  { method: "phonepe" },
                  { method: "paytm" },
                ],
              },
              wallet: {
                name: "Wallets",
                instruments: [
                  { method: "wallet", type: "paytm" },
                  { method: "wallet", type: "phonepe" },
                  { method: "wallet", type: "gpay" },
                ],
              },
             
            },
            hide: [
              {
                method: "paylater",
              },
            ],
            sequence: ["block.upi", "block.card", "block.netbanking"],
          },
        },
      };
      setOpenBuy(false);
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment.");
    }
    
    setPayProceed(false);
  };


  const handleChangeOffer = async () => {
    if (!offerAmount) {
      toast.error("Please enter an offer amount");
      return;
    }
    setSubmitBtn("Submitting..");
    try {
      const response = await fetch("http://localhost:5000/modifyOffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session, listingID: id, offerAmount }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Offer modified successfully!");

        setUserOffers({ offerAmount: Number(offerAmount), date: Date() });
        handleClose();
      } else {
        toast.error(data.message || "Failed to modify the offer.");
      }
    } catch (error) {
      console.error("Error modifying offer:", error);
      toast.error("Failed to modify offer.");
    }
    setSubmitBtn("Submit Offer");
  };

  const handleCancelOffer = async () => {
    if (!session) {
      toast.error("You must be logged in to cancel your offer.");
      return;
    }
    setCancelText("Cancelling..");

    try {
      const response = await fetch("http://localhost:5000/cancelOffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session, listingID: id }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Offer cancelled successfully!");
        setUserOffers(null);
        setOfferAmount(listing.type === "sale" ? null : listing.starting_bid.toString());
        setMadeOffer(false);
      } else {
        toast.error(data.message || "Failed to cancel the offer.");
      }
    } catch (error) {
      console.error("Error cancelling offer:", error);
      toast.error("Failed to cancel offer.");
    }
    setCancelText("Cancel");
  };


  const handleOffer = () => {
    const authToken = localStorage.getItem("wallet");
    if (!authToken) {
      navigate(`/login?redirect=/marketplace/land/${id}`);
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount) {
      toast.error("Please enter an offer amount");
      return;
    }

    setSubmitBtn("Submitting..");
    try {
      const response = await fetch("http://localhost:5000/makeOffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: session, offerAmount, listingID: id }),
      });

      const data = await response.json();
      if (data.success) {
        setUserOffers({ offerAmount: Number(offerAmount), date: new Date().toISOString() });
        toast.success("Offer made successfully!");
      } else {
        toast.error(data.message || "Failed to add offer.");

      }
    } catch (error) {
      toast.error(error || "Failed to add offer.");
    }
    setMadeOffer(true);

    setSubmitBtn("Submit Offer");
  };

  return (
    !isLoading ? <div className="min-h-screen bg-dark-200">
      <div className="pt-3 px-4 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
            <span style={{ fontSize: '18px' }}>Back</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-6">


            <div className="bg-dark-100 rounded-lg p-6">

              <div className="flex justify-between">
                <h1 className="text-2xl font-bold text-white mb-4">{listing.landDetails.city}, {listing.landDetails.state}</h1>
                <div>
                  <div className="bg-neon-purple px-3 py-1 rounded-full text-sm font-medium text-white">
                    {listing.type === "sale" ? "For Sale" : "Auction"}
                  </div>
                </div>
              </div>
              <div className="space-y-3">


                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign className="w-5 h-5" />
                  {listing.type === "sale" ?
                    <span>₹{(listing.landDetails.area_cent * listing.rate_per_cent).toLocaleString()} (₹{listing.rate_per_cent.toLocaleString()}/cent)</span> :
                    <span>Starting Bid: ₹{(listing.starting_bid).toLocaleString()} </span>}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <LandPlot className="w-5 h-5" />
                  <span>{listing.landDetails.area_cent} cent ({listing.landDetails.area_sqft} sq.ft)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <LocateFixed className="w-5 h-5" />
                  <span>Coordinates: {listing.landDetails.location.coordinates[0]}, {listing.landDetails.location.coordinates[1]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>Listed {formatDistanceToNow(new Date(listing?.listed_on), { addSuffix: true })}</span>
                </div>
                {listing.type === "auction" &&
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-5 h-5" />
                    <span>Auction End: {formatDate(new Date(listing?.auction_end_time),true)}</span>
                  </div>}
              </div>
            </div>
            <MapComponent coordinates={listing.landDetails.location.coordinates.reverse() as [number,number]} />
          </div>

          {/* Right Column - Details and History */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="bg-dark-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Seller Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <a href={`https://sepolia.etherscan.io/address//${listing.landDetails.ownerid}`} className="text-gray-400 hover:text-neon-purple transition-colors">
                    {listing.ownerName}
                  </a>
                </div>
                <div className="flex flex-col gap-3">
                  {!hasMadeOffer ? listing.type === "sale" ? (

                    <AlertDialog open={openBuy} onOpenChange={setOpenBuy}>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={handleOffer}
                          className="w-full bg-neon-purple text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                        >
                          Buy Land
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-dark-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Clicking Yes will proceed to payment page
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </AlertDialogTrigger>
                          <Button disabled={paymentProceeded} variant="default" onClick={() => buyLand()}>
                            {paymentProceeded && <LoaderCircle className="animate-spin mx-auto"  />}Yes
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : new Date().getTime() < new Date(listing.auction_end_time).getTime() ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={handleOffer}
                          className="w-full bg-neon-purple text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                        >
                          Place Bid
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-dark-200 ">
                        <DialogHeader>
                          <DialogTitle>Place Bid</DialogTitle>
                          <DialogDescription>
                            Enter your offer amount for this land
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            className="bg-dark-200"
                            value={offerAmount}
                            onChange={(e) =>
                              setOfferAmount(e.target.value)
                            }
                          />
                          <button
                            onClick={() => {
                              if (Number(offerAmount) >= listing.starting_bid) {
                                handleMakeOffer();
                              } else {
                                toast.error(`Minimum bid is ₹${listing.starting_bid}`);
                              }
                            }}
                            className="w-full bg-neon-purple text-white py-2 rounded-lg"
                          >
                            {submitBtnText}
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (<>
                    <button
                      disabled
                      className="w-full bg-red-500 text-white py-3 rounded-lg font-medium"
                    >
                      Auction Ended {formatDistanceToNow(new Date(listing?.auction_end_time), { addSuffix: true })}
                    </button>
                  </>) : (
                    <>
                      <div className="flex gap-4">
                        <Dialog open={open} onOpenChange={setOpen}>
                          <DialogTrigger asChild>
                            <button
                              onClick={handleOffer}
                              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium"
                            >
                              Change Offer
                            </button>

                          </DialogTrigger>
                          <DialogContent className="bg-dark-200 ">
                            <DialogHeader>
                              <DialogTitle>Change Offer</DialogTitle>
                              <DialogDescription>
                                Enter your new offer amount for this land
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                className="bg-dark-200"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                              />
                              <button
                                onClick={handleChangeOffer}
                                className="w-full bg-neon-purple text-white py-2 rounded-lg"
                              >
                                {submitBtnText}
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <button
                          onClick={handleCancelOffer}
                          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium"
                        >
                          {cancelBtnText}
                        </button>
                      </div>
                      {userOffer && (
                        <p className="text-sm text-gray-400 text-center">
                          You made an offer for ₹{userOffer.offerAmount.toLocaleString()} on {formatDate(userOffer.date,true)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top Bids */}
            {listing.type === "auction" ? (<div className="bg-dark-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Top 5 Bids</h2>
              <div className="space-y-4">
                {listing.offers
                  .sort((a, b) => b.amount - a.amount) // Sort offers by amount in descending order
                  .map((offer, index) => (
                    <div
                      key={`${offer.amount}-${index}`} // Use a unique key with index to avoid duplicate keys
                      className="flex items-start gap-3 pb-2 border-b border-gray-800 last:border-0"
                    >
                      <span className="text-white">{index + 1}.</span>
                      <div>
                        <span className="text-white">₹{offer.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}

              </div>
            </div>) : <></>}

            {/* Ownership History */}
            <div className="bg-dark-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Ownership History</h2>
              <div className="space-y-4">
                {listing.landDetails.ownerhistory
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((owner) => (
                  <div key={owner.owner} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <span className="text-gray-400">
                        <a href={"https://sepolia.etherscan.io/address//" + owner.owner} className="text-white hover:text-neon-purple transition-colors">
                          {owner.owner}
                        </a>
                        {listing.landDetails.owner == owner.owner && "  (Current Owner)"}
                      </span>
                      <p className="text-sm text-gray-400">{formatDate(Number(owner.date),true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div> : <div className="min-h-screen bg-dark-200"></div>
  );
};

export default LandDetails;
