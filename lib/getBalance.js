require("dotenv").config();
const {ethers}=require("ethers");

const tokensAddresses = [
    process.env.WETH_TOKEN_ADDRESS,
    process.env.USDT_TOKEN_ADDRESS,
    process.env.USDC_TOKEN_ADDRESS,
]

const ERC20_ABI = require("../abi/ERC20_ABI.json");
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

async function getETH_Balance() { // Function to query the ETH balance of account
    try {
        const balance = await provider.getBalance(process.env.WALLET_ADDRESS);
        console.log('ETH Balance:', ethers.formatEther(balance), 'ETH');
    } catch (error) {
        console.error('Error retrieving account ETH balance:', error);
    }
}

async function getTokenBalance() {
    tokensAddresses.forEach(async (tokenAddress) => {
        try {
            const TOKEN_CONTRACT = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
            const balance = await TOKEN_CONTRACT.balanceOf(process.env.WALLET_ADDRESS);
            const decimals = await TOKEN_CONTRACT.decimals();
            const name = await TOKEN_CONTRACT.name();
            const formattedBalance = ethers.formatUnits(balance, decimals);
            console.log( name + ' Token Balance:', formattedBalance, name);
        } catch (error) {
            console.error(`Error retrieving token balance (token address: ${tokenAddress}):`, error);
        }
    });
}

async function getBalance(){
    console.log("     Balance Sheet")
    await getETH_Balance();
    await getTokenBalance();
}

module.exports = getBalance;
