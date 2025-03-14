
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, DollarSign, User, Calendar, ArrowLeft, LocateFixed, LandPlot, HandCoins, Check } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';

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
    ownerid: string;
    location: Location;
    ownerName: OwnerName;
    area_sqft: number;
    area_cent: number;
    city: string;
    state: string;
    ownerhistory: OwnerHistory[];
}

interface Offer {
    amount: number;
    date: string;
    userID: string;
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


const YourListingLand = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // const listing = mockListings.find((l) => l.id === id);
    const [listing, setListing] = useState<Listing | null>(null);
    const [offerAmount, setOfferAmount] = useState("");
    const [isLoading, setLoading] = useState(true);
    const [hasMadeOffer, setMadeOffer] = useState(null);
    const [userOffer, setUserOffers] = useState<{
        offerAmount: number;
        date: string;
    } | null>(null);

    const session = localStorage.getItem("wallet");



    function formatDate(dateInput: string | Date) {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

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

        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
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
                    body: JSON.stringify({ userToken: session, listingID: id }),
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
                    body: JSON.stringify({ id: id, token: session }),
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


    return (
        !isLoading ? <div className="min-h-screen bg-dark-200">
            <div className="pt-3 px-4 border-b border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
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
                                        <span>Auction End: {formatDate(new Date(listing?.auction_end_time))}</span>
                                    </div>}
                            </div>
                        </div>
                        <MapComponent coordinates={listing.landDetails.location} />
                    </div>

                    {/* Right Column - Details and History */}
                    <div className="space-y-6">


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

                        {/* Offers */}
                        <div className="bg-dark-100 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Offers</h2>
                            <div className="space-y-4">
                                {listing.offers.map((offer) => (
                                    <div key={offer.userID} className="flex justify-between items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                                        <div className="flex gap-3">
                                            <HandCoins className="w-6 h-6 text-gray-400 mt-1" />
                                            <div>
                                                <span>
                                                    <a href={"https://sepolia.etherscan.io/address//" + offer.userID} className="hover:underline text-neon-purple transition-colors">
                                                        User
                                                    </a> Offered you ₹{offer.amount.toLocaleString()}
                                                </span>
                                                <p className="text-sm text-gray-400 mt-1">{formatDate(offer.date)}</p>
                                            </div>
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

export default YourListingLand;
