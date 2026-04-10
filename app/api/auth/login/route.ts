import { generateToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const loginSchema = z.object({
email: z.string().email(),
password: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await verifyPassword(password, user.hashedPassword))) {
           return NextResponse.json({ error: 'Invalid credentials' }, { status: 401});
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        });

        await setAuthCookie(token);

        return NextResponse.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500});
    }
}