
export const generateTransactionKey = async (): Promise<string> => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const input = timestamp + random + Math.random();

  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};