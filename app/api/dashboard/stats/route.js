import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    // Start of today at 00:00:00 (local/system time)
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const in7Days = new Date(startOfToday);
    in7Days.setDate(startOfToday.getDate() + 7);

    // 1. Total number of medicines/products
    const totalMedicines = await prisma.medicine.count();

    // 2. Total inventory quantity or stock units
    const stockAggregate = await prisma.medicine.aggregate({
      _sum: { quantity: true },
    });
    const totalStockUnits = stockAggregate._sum.quantity || 0;

    // 3. Total customers
    const totalCustomers = await prisma.customer.count();
    const smsOptedInCustomers = await prisma.customer.count({
      where: { sms_consent: true },
    });

    // 4. Low-stock medicine count (quantity > 0 and quantity < 10)
    const lowStock = await prisma.medicine.count({
      where: {
        quantity: {
          gt: 0,
          lt: 10,
        },
      },
    });

    // 5. Expired medicine count (expiry_date < today)
    const expired = await prisma.medicine.count({
      where: {
        expiry_date: {
          lt: startOfToday,
        },
      },
    });

    // 6. Expiring soon count (expiry_date >= today and expiry_date <= in7Days, quantity > 0)
    const expiringSoon = await prisma.medicine.count({
      where: {
        expiry_date: {
          gte: startOfToday,
          lte: in7Days,
        },
        quantity: {
          gt: 0,
        },
      },
    });

    // 7. Today's revenue and sales count
    const todaySalesData = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      select: {
        total_amount: true,
      },
    });
    const todayRevenue = todaySalesData.reduce((sum, s) => sum + s.total_amount, 0);
    const todaySalesCount = todaySalesData.length;

    // 8. Last 7 days revenue for sparkline
    const last7DaysRevenue = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfToday);
      d.setDate(startOfToday.getDate() - (6 - i));
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const daySales = await prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          total_amount: true,
        },
      });
      last7DaysRevenue.push(daySales._sum.total_amount || 0);
    }

    // 9. Recent Sales (top 8)
    const recentSales = await prisma.sale.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        saleItems: { include: { medicine: true } },
      },
    });

    // 10. Expiry alerts (medicines expiring within 7 days, with affected consenting customers)
    const expiringMedicines = await prisma.medicine.findMany({
      where: {
        expiry_date: {
          gte: startOfToday,
          lte: in7Days,
        },
        quantity: { gt: 0 },
      },
      orderBy: { expiry_date: 'asc' },
      take: 5,
    });

    const alerts = await Promise.all(
      expiringMedicines.map(async (med) => {
        const affectedCustomers = await prisma.customer.findMany({
          where: {
            sms_consent: true,
            sales: {
              some: {
                saleItems: {
                  some: { medicine_id: med.id },
                },
              },
            },
          },
          select: { id: true, name: true, mobile_number: true },
        });

        return {
          id: med.id,
          medicine: med,
          affectedCustomers,
        };
      })
    );

    return NextResponse.json({
      totalMedicines,
      totalStockUnits,
      totalCustomers,
      smsOptedInCustomers,
      lowStock,
      expired,
      expiringSoon,
      todayRevenue,
      todaySalesCount,
      last7DaysRevenue,
      recentSales,
      alerts,
    });
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats.' }, { status: 500 });
  }
}
