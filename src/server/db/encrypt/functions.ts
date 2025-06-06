import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  return crypto.createHash("sha256").update(secretKey).digest();
}

export function encryptSync(plaintext: string): string {
  try {
    const key = getEncryptionKey();

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plaintext, "utf8", "base64");
    ciphertext += cipher.final("base64");

    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(ciphertext, "base64"),
    ]);

    return combined.toString("base64");
  } catch (error) {
    throw new Error(`Encryption failed: ${(error as Error).message}`);
  }
}

export function decryptSync(encryptedData: string): string {
  try {
    const key = getEncryptionKey();

    const combined = Buffer.from(encryptedData, "base64");

    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const ciphertext = combined.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(ciphertext, undefined, "utf8");
    plaintext += decipher.final("utf8");

    return plaintext;
  } catch (error) {
    throw new Error(`Decryption failed: ${(error as Error).message}`);
  }
}
