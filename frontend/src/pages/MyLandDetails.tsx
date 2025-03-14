
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
import { jwtDecode, JwtPayload } from "jwt-decode";
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
  location: string;
  ownerName: OwnerName;
  areaInSqft: number;
  areaInCent: number;
  city: string;
  state: string;
  history: OwnerHistory[];
}


const MyLandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // const listing = mockListings.find((l) => l.id === id);
  const [land, setLand] = useState<LandDetails | null>(null);
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
  const [paymentProceeded, setPayProceed] = useState(false);
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
        const listingResponse = await fetch(`http://localhost:5000/getLand`, {
          method: "POST", // Change to GET
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: session, landID: id }),
          credentials: "include", // Send cookies if needed
        });

        const listingData = await listingResponse.json();

        if (!listingResponse.ok || !listingData.success) {
          throw new Error(listingData.error);
        }

        if (listingData.data.type === "auction") {
          // setOfferAmount(listingData.data.starting_bid);
        }

        setLand(listingData.data[0]); // ✅ Set Listing Data


      } catch (error: any) {
        setMadeOffer(false);
        toast.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, id, navigate, location]);

  if (!isLoading && !land) {
    return <div className="min-h-screen bg-dark-200 flex items-center justify-center text-white">Land not found</div>;
  }


  return (
    !isLoading ? <div className="min-h-screen bg-dark-200">
      <div className="pt-3 px-4 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/myLands')}
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
                <h1 className="text-2xl font-bold text-white mb-4">{land.city}, {land.state}</h1>
                <div>

                </div>
              </div>
              <div className="space-y-3">



                <div className="flex items-center gap-2 text-gray-400">
                  <LandPlot className="w-5 h-5" />
                  <span>{land.area_cent} cent ({land.area_sqft} sq.ft)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <LocateFixed className="w-5 h-5" />
                  <span>Coordinates: {land.location.coordinates[0]}, {land.location.coordinates[1]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>Owned since {formatDate(Number(land.ownerhistory.find(entry => entry.ownerid === land.owner).date), false)}</span>
                </div>

              </div>
            </div>
            <MapComponent coordinates={land.location.coordinates.reverse() as [number,number]} />
          </div>

          {/* Right Column - Details and History */}
          <div className="space-y-6">



            {/* Ownership History */}
            <div className="bg-dark-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Ownership History</h2>
              <div className="space-y-4">
                {land.ownerhistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((owner) => (
                    <div key={owner.owner} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <span className="text-gray-400">
                          <a href={"https://sepolia.etherscan.io/address//" + owner.owner} className="text-white hover:text-neon-purple transition-colors">
                            {owner.owner}
                          </a>
                          {land.owner == owner.owner && "  (Current Owner)"}
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

export default MyLandDetails;
