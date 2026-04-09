
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";




const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-2026';

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string) {
      return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    return jwt.verify(token, SECRET_KEY);
}

//Get current user from cookie (for protected routes)
export async function getCurrentUser() {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth-token')?.value;
    if (!token) return null;
    try {
        const decoded = verifyToken(token) as any;
        return decoded;
    } catch {
        return null;
    }
}