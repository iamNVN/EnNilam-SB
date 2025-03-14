// require("dotenv").config();
import {ethers} from "ethers";
import cors from "cors";
import express from "express";

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

// Smart contract setup
const contractABI = [
  {
    "inputs": [{"internalType": "string", "name": "documentURI", "type": "string"}],
    "name": "registerUserAndMintLand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const PRIVATE_KEY = "71fe7bc4ca848e3281bee4dab1f917dd3374d4de9da910d8abbe5d163bceaec9";
const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/a64-Qs3kDv9hQ-3OR7347260HBhJj49r");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract("0x440a8E05429FC47B876793C79eE5950ab44E6D93", contractABI, wallet);

// API Endpoints

// Register and mint land NFT
app.post("/mintLand", async (req, res) => {
  try {
    const { documentURI } = req.body;
    const tx = await contract.registerUserAndMintLand(documentURI);
    await tx.wait();
    res.json({ success: true, message: "Land NFT minted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get land ownership details
app.get("/getLand/:tokenId", async (req, res) => {
  try {
    const owner = await contract.ownerOf(req.params.tokenId);
    res.json({ success: true, owner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transfer land NFT
app.post("/transferLand", async (req, res) => {
  try {
    const { from, to, tokenId } = req.body;
    const tx = await contract.transferFrom(from, to, tokenId);
    await tx.wait();
    res.json({ success: true, message: "Land NFT transferred successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List lands owned by a wallet
app.get("/listLands/:walletAddress", async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    const filter = contract.filters.Transfer(null, walletAddress);
    const events = await contract.queryFilter(filter);
    const tokenIds = events.map(event => event.args.tokenId.toString());
    res.json({ success: true, lands: tokenIds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));