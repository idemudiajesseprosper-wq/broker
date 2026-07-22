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
