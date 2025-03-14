
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter, X, LoaderCircle, ArrowRight, LandPlot, LocateFixed, Calendar, User, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    name: string;
    areaInCent: number;
    city: string;
    state: string;
    history: OwnerHistory[];
}
const VerifyLand = () => {
    const navigate = useNavigate();
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
    const location = useLocation();
    const [isLoggedin, setLoggedin] = useState(false);
    const [inpLandID, setinpLandID] = useState("");
    const [inpOwnerID, setinpOwnerID] = useState("");
    const [land, setLand] = useState<LandDetails | null>(null);
    const [isOwner, setisOwner] = useState(false);
    const [hasChecked, setChecked] = useState(false);
    const [isLoading, setLoading] = useState("null");

    const [verifyBtnText, setverifyBtn] = useState("Verify");
    const session = localStorage.getItem("wallet");


    useEffect(() => {
        const fetchlands = async () => {
            if (!session) {
                navigate(`/login?redirect=/marketplace`);
                return;
            }
            setLoggedin(true);
        };

        fetchlands();
    }, [session, navigate]);


    const verifyLand = async () => {
        if (!inpLandID || !inpOwnerID) {
            return toast.error("Inputs are empty");
        }
        setChecked(true);
        setverifyBtn("Verifying..");
        setLoading("true");
        try {
            // 🛠️ Fetch Listing Details
            const listingResponse = await fetch("http://localhost:5000/verifyLand", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ landID: inpLandID, ownerID: inpOwnerID }),
                credentials: "include",
            });

            const listingData = await listingResponse.json();

            if (listingData.status) {
                setisOwner(true);
                setLand(listingData.data);
                // console.log(listingData);
            } else {
                setisOwner(false);
            }

        } catch (error) {
            console.log(error);
            toast.error("Error fetching data:", error.message);
        }
        setverifyBtn("Verify");
        setLoading("fin");

    };



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
                            Verify Land
                        </h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container   mx-auto px-8 pt-6 flex items-center justify-center">


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-xl p-8 rounded-2xl space-y-6 font-poppins"
                    >


                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="text-sm text-gray-400">Land Number/ID:</label>
                                <div className="relative mt-2">
                                    <Input
                                        type="text"
                                        required
                                        className="pl-10 rounded-xl h-10"
                                        onChange={(e) => { setinpLandID(e.target.value) }}
                                        placeholder="Enter the Land ID"
                                    />
                                </div>
                            </div>
                            <div >
                                <label className="text-sm text-gray-400">Owner ID:</label>
                                <div className="relative mt-2">
                                    <Input
                                        type="text"
                                        required
                                        className="pl-10 rounded-xl h-10"
                                        onChange={(e) => { setinpOwnerID(e.target.value) }}
                                        placeholder="Enter the Owner ID"
                                    />
                                </div>
                            </div>

                        </div>
                        <Button
                            onClick={verifyLand}
                            disabled={isLoading == "true" ? true : false}
                            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 w-full"
                        >
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/50 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                                {verifyBtnText}
                            </span>
                        </Button>
                    </motion.div>
                </div>
                <div className="pb-12 ">
                    {(hasChecked && isLoading == "fin") &&
                        (!isOwner ? <div className={
                            ` mx-auto mt-4 p-4 w-80 rounded-xl text-center font-semibold text-lg transition-colors animate-fade-in-fast bg-red-500/10 text-red-500 border-2 border-red-600/10`}>
                        User doesn't own the land
                    </div> :
                        <div className="mt-4 bg-dark-100 rounded-xl border-2 border-white/5 p-8 px-12 mx-80">

                            <div className="flex justify-between">
                                {/* <h1 className="text-2xl font-bold text-white mb-4">{land.city}, {land.state}</h1> */}
                                <div>

                                </div>
                            </div>
                            <div className="space-y-3">


                                <div className="flex items-center gap-2 text-gray-400">
                                    <User className="w-5 h-5" />
                                    <span><b>Owner name:</b> {land.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-5 h-5" />
                                    <span><b>Owned since:</b> {formatDate(Number(land.ownerhistory.find(entry => entry.ownerid === land.owner).date), false)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <LandPlot className="w-5 h-5" />
                                    <span><b>Area:</b> {land.area_cent} cent ({land.area_sqft} sq.ft)</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                    <span><b>City & State:</b> {land.city}, {land.state}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <LocateFixed className="w-5 h-5" />
                                    <span><b>Coordinates:</b> {land.location.coordinates[0]},{land.location.coordinates[1]}</span>
                                </div>

                                <h2 className="text-xl font-bold text-white pb-2 pt-5">Ownership History</h2>
                                <div className="space-y-4">
                                    {land.ownerhistory
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((owner) => (
                                            <div key={owner.owner} className="flex items-start gap-3 border-b border-gray-800 last:border-0">
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
                        </div>)}
                </div>

            </main >
        </div >
    );
};

export default VerifyLand;
