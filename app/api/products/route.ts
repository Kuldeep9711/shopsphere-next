import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";



const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    categoryId: z.number().int().positive(),
});

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { id: 'desc' },
        });
        return NextResponse.json(products);
    } catch {error} {
        return NextResponse.json({ error: 'Failed to fetch products' }, {status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, true); // Only admin can create products
        if (user instanceof NextResponse) return user;  // Error response

        const body = await request.json();
        const data = productSchema.parse(body);

        const product = await prisma.product.create({
            data,
            include: { category: true },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input'}, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}