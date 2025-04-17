const res = await fetch("https://tokens.uniswap.org/");
const data = await res.json();
const usdt = data.tokens.find(t => t.symbol === "usDt");
console.log(usdt.address);
