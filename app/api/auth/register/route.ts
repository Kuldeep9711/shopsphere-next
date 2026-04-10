import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { email, z } from 'zod';
import { error } from "console";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
        data: {
            email,
            hashedPassword,
            isAdmin: false,   // First user can be made admin manually in DB
        },
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        });

        await setAuthCookie(token);

        return NextResponse.json({
            message: 'User registered successfully',
            user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
        });

    } catch (error: any) {
        if ( error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        } 
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}