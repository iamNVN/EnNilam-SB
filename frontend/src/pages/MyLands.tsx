
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter, X, LoaderCircle, ArrowRight } from "lucide-react";
import { mockListings } from "@/data/mockListings";
import { format } from "date-fns";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const MyLands = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const [isLoading, setLoading] = useState(true);
    const [isLoggedin, setLoggedin] = useState(false);

    const [lands, setlands] = useState([]);
    const [error, setError] = useState(null);
    const session = localStorage.getItem("wallet");
    const isAuction = location.search === "?tab=auction";


    useEffect(() => {
        const fetchlands = async () => {
            if (!session) {
                navigate(`/login?redirect=/marketplace`);
                return;
            }
            setLoggedin(true);
            try {
                const response = await fetch("http://localhost:5000/getLands", {
                    method: "POST", // Change to GET
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wallet: session }),
                    credentials: "include", // Send cookies if needed
                });

                const data = await response.json();
                console.log(data);
              
                if (!response.ok || !data.success) throw new Error(data.error);


                setlands(data.data); // Update state with listings
            } catch (err) {
                console.log(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchlands();
    }, [session, navigate]);


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
                            My Lands
                        </h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-8 py-6">


                    {/* Listings Grid */}
                    {isLoading ? (
                        <div><LoaderCircle className="animate-spin mx-auto" size={50} /></div>
                    ) : <div>
                        {lands.length === 0 ? <p>You don't own any lands.</p>
                            : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lands.map((listing) => (
                                        <motion.div
                                            key={listing.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.3 }}
                                            onClick={() => navigate(`/myland/${listing.landid}`)}
                                            className="bg-dark-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-800"
                                        >
                                            <div className="p-6">



                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-100">
                                                                {listing.city}
                                                            </h3>
                                                            <p className="text-sm text-gray-400">{listing.state}</p>
                                                        </div>
                                                        {/* <div className="text-right">
                                                            <p className="text-2xl font-bold text-neon-purple">
                                                                Area: {listing.area_cent} cent
                                                            </p>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {listing.area_sqft} sq.ft
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-800 pt-3 mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-400">Area:</span>
                                                        <span className="text-sm font-medium text-gray-200">
                                                            {listing.area_cent} cents ({listing.area_sqft} sq.ft)
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-end text-neon-purple font-medium text-sm group">
                                                    View Details
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </motion.div>


                                    ))}
                                </div>
                            )}
                    </div>}
                </div>
            </main >
        </div >
    );
};

export default MyLands;
