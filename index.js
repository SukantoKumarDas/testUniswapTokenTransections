require("dotenv").config();
const {ethers}=require("ethers");

const checkConnection = require('./lib/checkConnection');
const getBalance = require('./lib/getBalance');
const swapTokenToToken = require('./lib/swapeTokenToToken');

const routerAbi = require("./abi/Uniswap_v2_Router_ABI.json");
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL); // Connect to the Ethereum network using a provider
const router = new ethers.Contract(process.env.UNISWAP_V2_ROUTER_ADDRESS, routerAbi, provider);

checkConnection().then(() => {
    getBalance().then(() => {
        swapTokenToToken(process.env.USDT_TOKEN_ADDRESS, process.env.USDC_TOKEN_ADDRESS, '10', router).then(() => {
            console.log("Swap completed");
        }).catch((error) => {
            console.error("Error in swapTokenToToken", error);
        });
    }).catch((error) => {
        console.error("Error in getBalance", error);
    });
}
).catch((error) => {
    console.error("Connection Failed", error);
});