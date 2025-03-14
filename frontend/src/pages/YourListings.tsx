
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Trash, Eye } from "lucide-react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const YourListings = () => {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [isLoggedin, setLoggedin] = useState(false);
    const [listings, setListings] = useState([]);
    const session = localStorage.getItem("wallet");
    const fetchListings = async () => {
        if (!session) {
            navigate(`/login?redirect=/YourListings`);
            return;
        }
        setLoggedin(true);
        try {
            const response = await fetch("http://localhost:5000/getYourListings", {
                method: "POST", // Change to GET
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken: session }),
                credentials: "include", // Send cookies if needed
            });

            const data = await response.json();
            console.log(data);
         
            if (!response.ok || !data.success) throw new Error(data.error);


            setListings(data.data); // Update state with listings
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {


        fetchListings();
    }, [session, navigate]);

    const deleteListing = async (id) => {
        try {
            const response = await fetch("http://localhost:5000/deleteListing", {
                method: "POST", // Change to GET
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken: session, listingID: id }),
                credentials: "include", // Send cookies if needed
            });

            const data = await response.json();
            console.log(data);
         
            if (!response.ok || !data.success) throw new Error(data.error);

            fetchListings();
            toast.success("Listing Deleted!")

        } catch (err) {
            console.log(err.message);
        }
    };

    const [isAuction, setIsAuction] = useState(false);
    const filteredListings = listings.filter((listing) =>
        listing.type === (isAuction ? "auction" : "sale")
    );

    return (
        !isLoggedin ? (
            <div><LoaderCircle className="animate-spin mx-auto" size={50} /></div>
        ) : <div className="min-h-screen bg-dark-200">
            <Sidebar />
            <Header />

            <main className=" pl-64">
                {/* Header */}
                <div className="pt-3 px-4 border-b border-gray-800">
                    <div className="container mx-auto px-4 py-6">
                        <h1 className="text-3xl font-bold text-white">
                            Your Listings
                        </h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-8 py-6">
               
                  

                    {/* Listings Grid */}
                    {isLoading ?
                        (<div><LoaderCircle className="animate-spin mx-auto" size={50} /></div>)
                        :

                        <div>
                                 <div className="mb-1">
                        <span className="text-white font-semibold text-lg ml-5">Total Listings : {listings.length}</span>
                        <span className="text-white font-medium text-md ml-5">Sale : {listings.filter((listing) =>
                            listing.type === "sale"
                        ).length}</span>
                        <span className="text-white font-medium text-md ml-5">Auction : {listings.filter((listing) =>
                            listing.type === "auction"
                        ).length}</span>
                    </div>
                            {listings.length === 0 ? (
                                <p className="text-center mt-10">No listings found.</p>
                            ) : (

                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-white">For Sale</span>
                                        <Switch checked={isAuction} onCheckedChange={setIsAuction} />
                                        <span className="text-white">For Auction</span>
                                    </div>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr>
                                                    <th className="p-2">S.No</th>
                                                    <th className="p-2">Location</th>
                                                    <th className="p-2">Area (Cent)</th>
                                                    {isAuction ? (
                                                        <>
                                                            <th className="p-2">Starting Bid</th>
                                                            <th className="p-2">Total Bids</th>
                                                            <th className="p-2">Highest Bid</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th className="p-2">Rate per Cent</th>
                                                        </>
                                                    )}
                                                    <th className="p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredListings.map((listing, index) => (
                                                    <tr key={listing.id} className="border-b border-gray-800">
                                                        <td className="p-2">{index + 1}</td>
                                                        <td className="p-2">{listing.landDetails.city}, {listing.landDetails.state}</td>
                                                        <td className="p-2">{listing.landDetails.area_cent}</td>
                                                        {isAuction ? (
                                                            <>
                                                                <td className="p-2">₹{listing.starting_bid.toLocaleString()}</td>
                                                                <td className="p-2">{listing.offers.length}</td>
                                                                <td className="p-2">₹{Math.max(...listing.offers.map((offer) => offer.amount), 0).toLocaleString()}
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="p-2">₹{listing.rate_per_cent.toLocaleString()}</td>
                                                            </>
                                                        )}
                                                        <td className="p-2 flex gap-2">
                                                            {isAuction && (<Button variant="outline" size="sm"
                                                                onClick={() => navigate(`/yourListing/land/${listing.id}`)}><Eye className="w-4 h-4" /></Button>
                                                            )}<AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">
                                                                        <Trash className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-dark-200">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the item.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="outline">Cancel</Button>
                                                                        </AlertDialogTrigger>
                                                                        <Button variant="destructive" onClick={() => deleteListing(listing.id)}>
                                                                            Confirm
                                                                        </Button>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                </div>)
                            }
                        </div>
                    }
                </div>
            </main >
        </div >
    );
};

export default YourListings;
