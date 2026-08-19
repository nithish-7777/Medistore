import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid customer ID.' }, { status: 400 });
    }

    // 1. Check if the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: parsedId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    // 2. Check if the customer has associated sales
    const salesCount = await prisma.sale.count({
      where: { customer_id: parsedId },
    });

    if (salesCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete customer because they have existing transaction history.',
      }, { status: 400 });
    }

    // 3. Safe to delete
    const deletedCustomer = await prisma.customer.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully.',
      customer: deletedCustomer,
    });
  } catch (error) {
    console.error('Customer deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete customer.' }, { status: 500 });
  }
}
