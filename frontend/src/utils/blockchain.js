import { ethers } from "ethers";
import LandRegistryABI from "../abis/LandRegistry.json";  

// Contract Addresses (Replace with your deployed addresses)
const LAND_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Function to connect to a smart contract
const getContract = (address, abi) => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install Metamask.");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};

// Connect to specific contracts
const getLandRegistryContract = () => getContract(LAND_REGISTRY_ADDRESS, LandRegistryABI);
export { getLandRegistryContract, getMarketplaceContract, getAuctionContract, getLoanContract };
