import LandRegistry from "./LandRegistry.json"; // ✅ Ensure this file exists
import Marketplace from "./Marketplace.json"; // ✅ Ensure this file exists

// ✅ Land Registry Contract
export const CONTRACT_ADDRESS = "0x440a8E05429FC47B876793C79eE5950ab44E6D93";  
export const ABI = LandRegistry.abi; // ✅ ABI for LandRegistry

// ✅ Marketplace Contract
export const CONTRACT_MARKETPLACE = "0x9E134e0B1b177fF9D7eFf1D16eE8928AAa94731f";  
export const ABI_MARKETPLACE = Marketplace.abi; // ✅ ABI for Marketplace
