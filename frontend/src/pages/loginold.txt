
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Magic } from "magic-sdk";
import { ethers } from "ethers";
import { useNavigate, useLocation } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { User, Timer, Send, LoaderCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { CONTRACT_ADDRESS, ABI } from "@/utils/constants";
import { createClient } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

const magic = new Magic("pk_live_98BF2C2D1B34BCED", {
  network: {
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/a64-Qs3kDv9hQ-3OR7347260HBhJj49r`,
    chainId: 11155111,
  },
});

// Define a simple interface for user data
interface UserData {
  id: string;
  aadhaar: string;
  is_verified: boolean | null;
  otp: string | null;
  created_at?: string;
}
const SUPABASE_URL = "https://sckzsqyesbculskcztlo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja3pzcXllc2JjdWxza2N6dGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNjcxNzEsImV4cCI6MjA1NDg0MzE3MX0.gWaZLIHp7gLJq7uJlaGHCmrkmstXi5_UCDB4B9NCv7s";
const SECRET_KEY = "561b06fada07165b16e93a0e42cf1632594393cfcf12a3ca9122918c440ed44c317b67d581d0fba5132f1e2920b075554c5d0bab01de7fc18da2fb28058abded";

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = localStorage.getItem("token");
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [walletAddresss, setWalletAddress] = useState("");
  const [open, setOpen] = useState(false);
  const [openBuy, setOpenBuy] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [buttonText, setButtonText] = useState("Verify OTP");
  const [getOTPbtntext, setOTPbtntext] = useState("Get OTP");
  const countdownRef = useRef<NodeJS.Timeout>();
  const [aaName, setName] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    const checkLogin = async () => {
      const storedWallet = localStorage.getItem("wallet");
      const isLoggedIn = await magic.user.isLoggedIn();

      if (storedWallet && isLoggedIn) {
        console.log("✅ Valid session found, redirecting to MyLands...");
        setWalletAddress(storedWallet);
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get("redirect") || "/dashboard"; // Default: Dashboard

        navigate(redirectTo);
        return;
      }

      console.log("❌ No active Magic session, staying on Login Page.");
    };

    checkLogin();
  }, [navigate]);

  const preLogin = async () => {
    const response = await fetch("http://localhost:5000/getAadhaar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaar, stayLoggedIn: true }),
    });

    const data = await response.json();
    const phone = data?.phone;
    const name = data?.name;
    setName(name);
  }

  const handleMagicLogin = async () => {
    setLoading(true);
    setOpenBuy(false);
    const response = await fetch("http://localhost:5000/getAadhaar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaar, stayLoggedIn: true }),
    });

    const data = await response.json();
    const phone = data?.phone;
    const name = data?.name;

    if (phone.length !== 10 || aadhaar.length !== 12) {
      toast.error("Enter a valid Aadhaar Number");
      return;
    }

    console.log("📢 Triggering Magic Link for OTP login...");

    try {
      await magic.user.logout(); // Ensure fresh session before login
      const didToken = await magic.auth.loginWithSMS({ phoneNumber: `+91${phone}` });

      if (!didToken) {
        toast.error("Magic Link OTP not sent. Try again.");
        return;
      }

      console.log("✅ OTP Sent! Waiting for verification...");
      toast.success("Logged in", { description: "Please wait a few minutes while we setup your account" });

      // ✅ Wait for Magic to verify login
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        toast.error("OTP Verification Failed. Try Again.");
        return;
      }

      const metadata = await magic.user.getInfo();
      if (!metadata.publicAddress) {
        toast.error("Failed to retrieve wallet address.");
        return;
      }

      //setWalletAddress(metadata.publicAddress);

      aadhaar == "607015064256" ?
        localStorage.setItem("wallet", "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a") :
        localStorage.setItem("wallet", "0x90F79bf6EB2c4f870365E785982E1f101E93b906");

      aadhaar == "607015064256" ?
        setWalletAddress("0xFABB0ac9d68B0B445fB7357272Ff202C5651694a") :
        setWalletAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906");
      console.log("✅ Wallet Address Retrieved:", metadata.publicAddress);
      // const { data, error } = await supabase
      //   .from('users_new')
      //   .update({ wallet_address: metadata.publicAddress })
      //   .eq('aadhaar', aadhaar);
      console.log(aadhaar == "794704080339");
      await mintNFT(aadhaar, aadhaar == "607015064256" ?
        "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a" :
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906");
      // await handlePostLogin(metadata.publicAddress);
      await handlePostLogin(metadata.publicAddress);


      console.log("✅ All checks passed. Redirecting to MyLands...");
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Magic Login Error:", error);
      toast.error("Login Failed", { description: error.message });
    }
    setLoading(false);
  };

  const handlePostLogin = async (walletAddress: string) => {
    // const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/a64-Qs3kDv9hQ-3OR7347260HBhJj49r");
    // await provider.ready;
    // const signer = await provider.getSigner();

    const provider = new ethers.BrowserProvider(magic.rpcProvider);
    const signer = await provider.getSigner();

    console.log("Checking Wallet Connection...");
    console.log("Signer Address:", await signer.getAddress());

    const contract = new ethers.Contract(
      "0xDA73D1fD76C465dbFC014D77c1064FC32986669B",
      ABI,
      signer
    );

    const balance = await provider.getBalance(walletAddress);
    if (Number(balance) < Number(ethers.parseEther("0.005"))) {
      toast.info("Funding wallet with ETH...");
      await fundWallet(walletAddress);
    } else {
      console.log("✅ Wallet already has enough ETH.");
    }

    const hasNFT = await contract.balanceOf(walletAddress);
    // await mintNFT(aadhaar, walletAddress);

    if (hasNFT === 0n) {
      toast.info("Minting Land NFT...");
      // await mintNFT(aadhaar, walletAddress);
      // await mintDummyLandNFT(contract, signer);
    } else {
      console.log("✅ User already has an NFT.");
    }
  };

  const fundWallet = async (walletAddress: string) => {
    try {
      const faucetWallet = new ethers.Wallet(
        "5d1c4e45280d8a1472527617b5eb5aeaac71fe5eab4031dd5193c7c29802aa9c",
        new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/a64-Qs3kDv9hQ-3OR7347260HBhJj49r")
      );
      const tx = await faucetWallet.sendTransaction({
        to: walletAddress,
        value: ethers.parseEther("0.01"),
      });
      await tx.wait();
      toast.success("Wallet Funded with 0.01 ETH");
    } catch (error) {
      console.error("Funding Error:", error);
      // toast.error("Failed to fund wallet");
    }
  };

  const mintNFT = async (aadhaar, walletAddress) => {
    const response = await fetch("http://localhost:5000/mintLands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaar, wallet: walletAddress }),
    });

    const data = await response.json();
  }

  if (session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl glass-morphism space-y-6 font-poppins"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Login to EnNilam</h2>
          <h2 className="text-sm mt-2 font-normal text-gray-400">Please enter your Aadhaar Number</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Aadhaar Number</label>
            <div className="relative">
              <Input
                type="text"
                maxLength={12}
                value={aadhaar}
                disabled={showOtp}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                className="pl-10"
                placeholder="Enter your 12-digit Aadhaar number"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="stayLoggedIn"
              checked={stayLoggedIn}
              onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
            />
            <label
              htmlFor="stayLoggedIn"
              className="text-sm text-gray-400 cursor-pointer"
            >
              Stay logged in
            </label>
          </div>
          <AlertDialog open={openBuy} onOpenChange={setOpenBuy}>
            <AlertDialogTrigger asChild>

              <button
                onClick={preLogin}
                className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 w-full"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/50 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  {isLoading ? "Processing.." : "Get OTP"}
                </span>
              </button>
            </AlertDialogTrigger>
            {aaName && <AlertDialogContent className="bg-dark-200">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you, {aaName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Click yes to log into the platform
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogTrigger>
                <Button variant="default" onClick={() => handleMagicLogin()}>
                  Yes
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>}
          </AlertDialog>



        </div>
      </motion.div>
    </div>
  );
};

export default Login;
