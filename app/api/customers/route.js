import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: {
      sales: {
        include: {
          saleItems: {
            include: { medicine: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(customers);
}
