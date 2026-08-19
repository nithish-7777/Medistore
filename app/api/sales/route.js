import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const sales = await prisma.sale.findMany({
    include: {
      customer: true,
      saleItems: { include: { medicine: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(sales);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, customerName, mobileNumber, smsConsent, items } = body;
    // items: [{ medicineId, quantity }]

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one medicine item is required.' }, { status: 400 });
    }

    if (!customerId && (!customerName || !mobileNumber)) {
      return NextResponse.json({ error: 'Customer name and mobile number are required for new customers.' }, { status: 400 });
    }

    // Validate stock
    for (const item of items) {
      const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!med) return NextResponse.json({ error: `Medicine ID ${item.medicineId} not found.` }, { status: 404 });
      if (med.quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${med.name}.` }, { status: 400 });
      }
    }

    // Resolve Customer
    let customer;
    if (customerId) {
      const parsedCustomerId = parseInt(customerId);
      customer = await prisma.customer.findUnique({ where: { id: parsedCustomerId } });
      if (!customer) {
        return NextResponse.json({ error: 'Selected customer not found.' }, { status: 404 });
      }
      if (smsConsent !== undefined && smsConsent !== customer.sms_consent) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { sms_consent: smsConsent },
        });
      }
    } else {
      let formattedMobile = mobileNumber.trim();
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else if (!/^\+91\d{10}$/.test(formattedMobile)) {
        return NextResponse.json({ error: 'Mobile number must be 10 digits or in +91xxxxxxxxxx format.' }, { status: 400 });
      }

      customer = await prisma.customer.upsert({
        where: { mobile_number: formattedMobile },
        update: { name: customerName, sms_consent: smsConsent },
        create: { name: customerName, mobile_number: formattedMobile, sms_consent: smsConsent },
      });
    }

    // Calculate total
    let totalAmount = 0;
    const saleItemsData = [];
    for (const item of items) {
      const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      totalAmount += med.unit_price * item.quantity;
      saleItemsData.push({ medicine_id: med.id, quantity: item.quantity, unit_price_at_sale: med.unit_price });
    }

    // Create sale + items + update stock in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          customer_id: customer.id,
          total_amount: totalAmount,
          saleItems: {
            create: saleItemsData,
          },
        },
        include: { saleItems: true },
      });

      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create sale.' }, { status: 500 });
  }
}
