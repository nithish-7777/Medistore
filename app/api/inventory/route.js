import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const medicines = await prisma.medicine.findMany({
    where: {
      AND: [
        search ? { name: { contains: search, mode: 'insensitive' } } : {},
        category ? { category } : {},
      ],
    },
    orderBy: { expiry_date: 'asc' },
  });

  return NextResponse.json(medicines);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, batch_number, manufacturer, manufactured_date, expiry_date, quantity, unit_price, category } = body;

    if (!name || !batch_number || !manufacturer || !manufactured_date || !expiry_date || !quantity || !unit_price) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        batch_number,
        manufacturer,
        manufactured_date: new Date(manufactured_date),
        expiry_date: new Date(expiry_date),
        quantity: parseInt(quantity),
        unit_price: parseFloat(unit_price),
        category: category || null,
      },
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create medicine.' }, { status: 500 });
  }
}
