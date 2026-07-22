import crypto from "node:crypto";

export function verifyHmac({ body, secret, signature, encoding }) {
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest(encoding);

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function verifySvixWebhook({ body, id, secret, signature, timestamp }) {
  if (!body || !id || !secret || !signature || !timestamp) return false;

  const timestampNumber = Number(timestamp);
  if (
    !Number.isFinite(timestampNumber) ||
    Math.abs(Date.now() / 1000 - timestampNumber) > 5 * 60
  ) {
    return false;
  }

  const encodedSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const expected = crypto
    .createHmac("sha256", Buffer.from(encodedSecret, "base64"))
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  return signature.split(" ").some((item) => {
    const candidate = item.startsWith("v1,") ? item.slice(3) : "";
    const candidateBuffer = Buffer.from(candidate);
    const expectedBuffer = Buffer.from(expected);
    return (
      candidateBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(candidateBuffer, expectedBuffer)
    );
  });
}
