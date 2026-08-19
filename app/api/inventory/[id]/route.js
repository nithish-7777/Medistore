import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, batch_number, manufacturer, manufactured_date, expiry_date, quantity, unit_price, category } = body;

    const medicine = await prisma.medicine.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(medicine);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medicine.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid medicine ID.' }, { status: 400 });
    }

    // 1. Check if the medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: parsedId },
    });

    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found.' }, { status: 404 });
    }

    // 2. Check if referenced in sales history
    const saleItemsCount = await prisma.saleItem.count({
      where: { medicine_id: parsedId },
    });

    if (saleItemsCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete medicine because it is referenced by existing sales.',
      }, { status: 400 });
    }

    // 3. Safe to delete
    const deletedMedicine = await prisma.medicine.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({
      success: true,
      message: 'Medicine deleted successfully.',
      medicine: deletedMedicine,
    });
  } catch (error) {
    console.error('Medicine deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete medicine.' }, { status: 500 });
  }
}
