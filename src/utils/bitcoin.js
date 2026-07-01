export async function fetchBtcUsdPrice() {
  const response = await fetch(
    "https://api.coindesk.com/v1/bpi/currentprice/USD.json",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch BTC price");
  }

  const data = await response.json();
  return Number(data.bpi.USD.rate_float);
}
