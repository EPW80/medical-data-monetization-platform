// encryption.js
const crypto = require("crypto");

class EncryptionHandler {
  constructor() {
    // Generate a random encryption key
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  }

  // Encrypt health data
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  // Decrypt health data
  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.encryptionKey,
      Buffer.from(encryptedData.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  }
}

module.exports = new EncryptionHandler();
