import crypto from "crypto";

export const encryptId = (id: string): string => {
  // Chuyển UUID thành buffer
  const idBuffer = Buffer.from(id.replace(/-/g, ""), "hex");
  // Mã hóa base64 và làm cho URL safe
  return idBuffer
    .toString("base64")
    .replace(/\+/g, "-") // Thay + thành -
    .replace(/\//g, "_") // Thay / thành _
    .replace(/=+$/, ""); // Xóa padding =
};

export const decryptId = (encryptedId: string): string => {
  try {
    // Khôi phục về base64 chuẩn
    let base64 = encryptedId
      .replace(/-/g, "+") // Thay - thành +
      .replace(/_/g, "/"); // Thay _ thành /

    // Thêm padding nếu cần
    while (base64.length % 4) {
      base64 += "=";
    }

    // Giải mã base64 về hex
    const idHex = Buffer.from(base64, "base64").toString("hex");

    // Thêm dấu gạch ngang để tạo UUID
    return [
      idHex.slice(0, 8),
      idHex.slice(8, 12),
      idHex.slice(12, 16),
      idHex.slice(16, 20),
      idHex.slice(20),
    ].join("-");
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedId; // Trả về ID gốc nếu giải mã thất bại
  }
};

// Encrypt and Decript Email
const ENCRYPTION_KEY = (
  process.env.ENCRYPTION_KEY || "abcdefghijklmnopqrstuvwx"
)
  .padEnd(32, "0")
  .slice(0, 32); // Ensure 32 bytes
const IV = (process.env.IV || "1234567890123456").padEnd(16, "0").slice(0, 16); // Ensure 16 bytes

// Encrypt function
export function encryptEmail(text: string) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    IV
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

// Decrypt function
export function decryptEmail(text: string) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    IV
  );
  let decrypted = decipher.update(Buffer.from(text, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
