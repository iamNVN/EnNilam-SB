
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapPin, DollarSign, ArrowLeft, Check, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ownedLands = [
  {
    id: "owned1",
    name: "Mountain View Plot",
    location: "Mysore, Karnataka",
    area: { sqft: 2000, cent: 4 },
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  },
  {
    id: "owned2",
    name: "Lakefront Property",
    location: "Coorg, Karnataka",
    area: { sqft: 3000, cent: 2 },
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  },
];

const Sell = () => {
  const [selectedLand, setSelectedLand] = useState(null);
  const [listBtnText, setBtnText] = useState('Confirm Listing');
  const [ratePerCent, setRatePerCent] = useState<number>(0);
  const [listingType, setListingType] = useState<"sale" | "auction">("sale");
  const [startingBid, setStartingBid] = useState(0);
  const [auctionEndTime, setAuctionEndTime] = useState("");
  const [hasListed, setListingStatus] = useState(false);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = localStorage.getItem("wallet");
  const navigate = useNavigate();

  const getLands = async () => {
    try {
      
      const response = await fetch("http://localhost:5000/getAvailableLands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: session }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error);

      setLands(data.data); // Store fetched lands in state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!session) {
      navigate('/login?redirect=/sellLand');
      return;
    }
    getLands();

  }, [session, navigate]);

  const handleSellConfirm = async () => {
    if (!selectedLand && (listingType === "sale" && !ratePerCent)) {
      toast.error("Please select a land and enter rate per cent");
      return;
    }
    setBtnText("Listing..");
    
    try {
      const response = await fetch("http://localhost:5000/createListing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landID: selectedLand?.landid, ratePerCent, type: listingType, startingBid, auctionEndTime, userToken: session }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error);

      setListingStatus(true);
      let countdown = 2;

      const showCountdownToast = (timeLeft) => {
        toast.success(`Redirecting in ${timeLeft}s`, {
          duration: 1000,
        });
      };

      showCountdownToast(countdown);

      const intervalId = setInterval(() => {
        countdown -= 1;
        showCountdownToast(countdown);

        if (countdown === 0) {
          clearInterval(intervalId);
          navigate('/yourListings');
        }
      }, 1000);

    } catch (error: any) {
      toast.error('Failed to add Listing', { description: error?.message || 'Please try again' });
    }
  };


  // const selectedLandDetails = ownedLands.find(land => land.id === selectedLand);
  const totalPrice = selectedLand ? selectedLand.area_cent * ratePerCent : 0;

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-dark-200">
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
      <div className="max-w-7xl pb-6 px-6 mx-auto mt-10">
        <h1 className="text-3xl font-bold text-white mb-8">List Your Land for Sale</h1>

        {loading ? <div><LoaderCircle className="animate-spin mx-auto" size={50} /></div> :
          <div>
            {lands.length === 0 ? (
              <p>No lands found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {lands.map((land) => (
                  <motion.div
                    key={land.landid}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {setSelectedLand(land); 
                      setTimeout(() => {
                        const saleFormElement = document.getElementById("saleForm");
                        if (saleFormElement) {
                          saleFormElement.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 100);
                    }}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors
                           ${selectedLand === land ? "border-neon-purple" : "border-transparent"}`}
                  >
                    <div className="relative h-40 bg-dark-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-800 ">

                      <div className="p-4 absolute bottom-4 left-4 text-white">
                     
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">
                            {land.city}
                          </h3>
                          <p className="text-sm text-gray-400">{land.state}</p>
                        </div>
                      <div className="border-t border-gray-800 pt-3 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Area:</span>
                          <span className="text-sm font-medium text-gray-200">
                            {land.area_cent} cents ({land.area_sqft} sq.ft)
                          </span>
                        </div>
                      </div>
                      </div>
                    </div>

                  </motion.div>
                  // <li key={land.landid} className="mb-2">
                  //     <strong>City:</strong> {land.city} | <strong>State:</strong> {land.state} | <strong>Area:</strong> {land.area_cent} cent
                  // </li>
                ))}
              </div>
            )}
          </div>
        }


        { }
        {selectedLand && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="saleForm"
            className="bg-dark-100 rounded-lg p-6 space-y-6"
          >
            {/* Listing Type Switch */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-gray-400">Listing Type:</span>
              <div
                className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all ${listingType === "auction" ? "bg-green-500" : "bg-gray-600"
                  }`}
                onClick={() => setListingType(listingType === "sale" ? "auction" : "sale")}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${listingType === "auction" ? "translate-x-8" : "translate-x-0"
                    }`}
                ></div>
              </div>
              <span className="text-sm text-gray-400">
                {listingType === "sale" ? "Sale" : "Auction"}
              </span>
            </div>

            {listingType === "sale" && (<div>
              <label className="block text-sm text-gray-400 mb-2">
                Rate per Cent (sq ft)
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={ratePerCent}
                  onChange={(e) => setRatePerCent(Number(e.target.value))}
                  className="flex-1 px-4 py-2 bg-dark-200 rounded-lg text-white"
                  placeholder="Enter rate per cent"
                />
              </div>
            </div>)}


            {/* Conditional Fields for Auction */}
            {listingType === "auction" && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* Starting Bid */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Starting Bid
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={startingBid}
                      onChange={(e) => setStartingBid(Number(e.target.value))}
                      className="flex-1 px-4 py-2 bg-dark-200 rounded-lg text-white"
                      placeholder="Enter starting bid"
                    />
                  </div>
                </div>

                {/* Auction End Time */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Auction End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={auctionEndTime}
                    onFocus={(e) => e.target.showPicker()}
                    onChange={(e) => setAuctionEndTime(e.target.value)}
                    className="w-full px-4 py-2 text-white bg-dark-200 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Total Area</span>
                <span>{selectedLand?.area_cent} cent</span>
              </div>
              <div className="flex justify-between text-white text-xl font-bold">
                <span>{listingType === "auction" ? 'Starting Bid' : 'Total Price'}</span>
                <span>₹{listingType === "auction" ? startingBid.toLocaleString() : totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSellConfirm}
              className={`w-full ${hasListed ? `bg-green-500` : `bg-neon-purple`} text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors`}
            >
              {hasListed ? <div className="flex justify-center items-center gap-1">
                <Check /> Listed Successfully
              </div> : <div>{listBtnText}</div>}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Sell;
