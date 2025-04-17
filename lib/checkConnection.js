require("dotenv").config();
const { ethers } = require("ethers");

// Connect to the Ethereum network using a provider
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

async function checkConnection() {
    try {
        const network = await provider.getNetwork();
        console.log("✅ Connected to Ethereum network:", network.name);
        
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 Latest Block:", blockNumber);
    } catch (error) {
        console.error("❌ Error connecting to network:", error);
    }
}

module.exports = checkConnection;