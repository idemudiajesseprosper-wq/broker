import crypto from "node:crypto";

export function generatePaystackReference(userId) {
  return `DEP_${userId}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

export function verifyPaystackSignature(rawBody, signature) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined");
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

export async function initializePaystackTransaction({
  email,
  amountKobo,
  reference,
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined");
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountKobo,
        email,
        reference,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(
      data.message || "Unable to initialize Paystack transaction",
    );
  }

  return data.data;
}
