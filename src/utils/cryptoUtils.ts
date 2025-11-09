import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY not set in environment variables");
}
const key = crypto.createHash('sha256')
    .update(process.env.ENCRYPTION_KEY)
    .digest();

export function encrypt(text: string) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string | null) {
    try {
        if (!encryptedText) return null;
        const [ivHex, encrypted] = encryptedText.split(':');
        if (!ivHex || !encrypted) return null;
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
        return decrypted;
    } catch (err: unknown) {
        console.error('Decryption failed:', (err as Error).message);
        return null;
    }
}
