const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
require('dotenv').config();
const cors = require("cors");
const app = express();
app.use(bodyParser.json());

// Contract ABI and address
const LandRegistryABI = require('./artifacts/contracts/LandRegistry.sol/LandRegistry.json').abi;
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
app.use(
  cors({
    origin: "http://localhost:8080", // Allow frontend running on this URL
    credentials: true, // Allow cookies & authorization headers
  })
);
// Configure provider and signer
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, LandRegistryABI, wallet);

// Middleware to handle errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
});


// 🟢 Mint New Land (Admin Only)
app.post('/api/land/mint', asyncHandler(async (req, res) => {
  const { owner, landId, location, state, city, area, areaInCent, areaInSqft } = req.body;
  if (!owner || !landId || !location || !state || !city || !area || !areaInCent || !areaInSqft) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const tx = await contract.mintLand(owner, landId, location, state, city, area, areaInCent, areaInSqft, { gasLimit: 1000000 });
  const receipt = await tx.wait();
 
  res.json({
    success: true, message: 'Land minted successfully', transactionHash: receipt.transactionHash
  });
}));

// 🔍 Get Land Details
app.get('/api/land/:landId', asyncHandler(async (req, res) => {
  try {
    const { landId } = req.params;
    const landDetails = await contract.getLand(landId);
    
    const formattedLandDetails = {
      landId: landDetails[0],
      owner: landDetails[1],
      location: landDetails[2],
      state: landDetails[3],
      city: landDetails[4],
      area: landDetails[5].toString(),
      areaInCent: landDetails[6].toString(),
      areaInSqft: landDetails[7].toString(),
      history: landDetails[8].map(([date, owner]) => ({ date: date.toString(), owner }))
    };

    res.json({ success: true, data: formattedLandDetails });
  } catch (error) {
    if (error.message.includes('Land does not exist')) {
      res.status(404).json({ message: 'Land not found' });
    } else {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}));

app.get('/api/land/:landId/:ownerId', asyncHandler(async (req, res) => {
  try {
    const { landId, ownerId } = req.params;
    const landDetails = await contract.getLand(landId);

    // Convert BigInt values to strings for JSON serialization
    const formattedLandDetails = {
      landId: landDetails[0],
      owner: landDetails[1],
      location: landDetails[2],
      state: landDetails[3],
      city: landDetails[4],
      area: landDetails[5].toString(),
      areaInCent: landDetails[6].toString(),
      areaInSqft: landDetails[7].toString(),
      history: landDetails[8].map(([date, owner]) => ({ date: date.toString(), owner }))
    };

    if (formattedLandDetails.owner == ownerId) {
      res.json({ success: true, status: true, data: formattedLandDetails });
    } else {
      res.json({ success: true, status: false });

    }

  } catch (error) {
    if (error.message.includes('Land does not exist')) {
      res.status(404).json({ message: 'Land not found' });
    } else {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}));

// 🔄 Transfer Land (Secured)
app.post('/api/land/transfer', asyncHandler(async (req, res) => {
  const { landId, newOwner, owner, privateKey } = req.body;

  if (!landId || !newOwner || !owner || !privateKey) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // 🛠 Use the owner's private key to create a signer
    // const ownerPrivateKey = "0xYOUR_OWNER_PRIVATE_KEY"; // Replace with the actual private key
    const signer = new ethers.Wallet(privateKey, provider);

    // 🔗 Connect the contract with the correct signer
    const contractWithSigner = contract.connect(signer);

    // 🔄 Perform the transfer
    const tx = await contractWithSigner.transferLand(landId, newOwner);
    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Land transferred successfully',
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.reason || 'Failed to transfer land'
    });
  }
}));

// 🔍 Get All Lands Owned by a Specific Address
app.get('/api/land/owned/:owner', asyncHandler(async (req, res) => {
  const { owner } = req.params;

  try {
    const ownedLands = await contract.getLandsByOwner(owner);
    const formattedLands = ownedLands
      .filter(land => land.landId) // Filter out empty entries
      .map(land => ({
        landId: land.landId,
        owner: land.owner,
        location: land.location,
        state: land.state,
        city: land.city,
        area: land.area.toString(),
        areaInCent: land.areaInCent,
        areaInSqft: land.areaInSqft,
        history: land.history.map(entry => ({
          date: entry.date.toString(),
          owner: entry.owner
        }))
      }));

    res.json({ success: true, data: formattedLands });
  } catch (error) {
    console.error('Error fetching owned lands:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch owned lands' });
  }
}));


// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
