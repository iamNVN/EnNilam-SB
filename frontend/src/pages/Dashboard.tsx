import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter, MapPin, DollarSign, History, Phone, User, X, ChartColumnBig, ScrollText, KeyRound } from "lucide-react";
import { mockListings } from "@/data/mockListings";
import type { Listing } from "@/types/marketplace";
import Cookies from 'js-cookie';
import Header from "@/components/Header";
import Sidebar, { getUserName } from "@/components/Sidebar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setLoading] = useState(true);
    const session = localStorage.getItem("wallet");
    const isAuction = location.search === "?tab=auction";
    const [userData, setUserData] = useState(null);


    useEffect(() => {
        if (!session) {
            navigate(`/login?redirect=/marketplace`);
            return;
        }
        const fetchData = async () => {
            try {
                // 🛠️ Fetch Listing Details
                const listingResponse = await fetch("http://localhost:5000/userDashboard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wallet: session }),
                    credentials: "include",
                });

                const listingData = await listingResponse.json();

             
                if (!listingResponse.ok || !listingData.success) {
                    throw new Error(listingData.error);
                }


                setUserData(listingData.data); // ✅ Set Listing Data


            } catch (error: any) {

                toast.error("Error fetching data:", error.message);
            }
            setLoading(false);
        }
        fetchData();
    }, [session, navigate]);

    return (
        !isLoading ? <div className="min-h-screen bg-dark-200">
            <Sidebar />
            <Header />

            <main className=" pl-64">
                {/* Header */}
                <div className="pt-3 px-4  border-b border-gray-800">
                    <div className="container mx-auto px-4 py-6">
                        <h1 className="mb-1 text-3xl font-bold text-white">
                            Dashboard
                        </h1>
                        <span className="text-gray-400">Welcome back! Here's what's happening with your lands</span>
                    </div>

                </div>

                {/* Main Content */}
                <div className="container mx-auto px-8 py-6">

                    {/* Listings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div

                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-dark-100 rounded-xl overflow-hidden cursor-pointer transition-transform border border-white/10"
                        >
                            <div className="flex items-center justify-between pr-7">
                                <div className="px-7 py-5 flex flex-col gap-2 justify-between">

                                    <div className="text-gray-400 text-md">
                                        <span>Owned Lands</span>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">{userData.lands}</h2>
                                </div>
                                <div className="w-12 h-12 flex items-center justify-center bg-green-400 bg-opacity-20 rounded-full">
                                    <ChartColumnBig size={24} className="text-green-500" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div

                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-dark-100 rounded-xl overflow-hidden cursor-pointer transition-transform border border-white/10"
                        >
                            <div className="flex items-center justify-between pr-7">
                                <div className="px-7 py-5 flex flex-col gap-2 justify-between">

                                    <div className="text-gray-400 text-md">
                                        <span>Live Listings</span>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">{userData.activeListings}</h2>
                                </div>
                                <div className="w-12 h-12 flex items-center justify-center bg-purple-400 bg-opacity-20 rounded-full">
                                    <ScrollText size={24} className="text-purple-500" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div

                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-dark-100 rounded-xl overflow-hidden cursor-pointer transition-transform border border-white/10"
                        >
                            <div className="flex items-center justify-between pr-7">
                                <div className="px-7 py-5 flex flex-col gap-2 justify-between">

                                    <div className="text-gray-400 text-md">
                                        <span>Total Listings</span>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">{userData.totalListings}</h2>
                                </div>
                                <div className="w-12 h-12 flex items-center justify-center bg-purple-400 bg-opacity-20 rounded-full">
                                    <ScrollText size={24} className="text-purple-500" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="mt-12 ">
                        <label className="text-md text-gray-400 mt-2 mr-3">Your Wallet Address:</label>
                        <div className="relative">
                            <Input
                                type="text"
                                value={localStorage.getItem("wallet")}
                                disabled={true}
                                className="pl-10 rounded-xl mt-2 bg-dark-100 border-2 border-white/10 w-[450px] text-left"
                            />
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                </div>
            </main>
        </div> : <div className="min-h-screen bg-dark-200"></div>
    );
};

export default Dashboard;
