import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client conditionally to avoid crashing if env vars are missing
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function GET() {
  const today = new Date();
  const in7Days = new Date();
  in7Days.setDate(today.getDate() + 7);

  // Find medicines expiring within 7 days
  const expiringMedicines = await prisma.medicine.findMany({
    where: {
      expiry_date: {
        gte: today,
        lte: in7Days,
      },
      quantity: { gt: 0 },
    },
    orderBy: { expiry_date: 'asc' },
  });

  // For each expiring medicine, find consenting customers who bought it
  const alertData = await Promise.all(
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

      const customerAlertStatuses = [];

      // Real SMS delivery — replace with Twilio/SNS in production
      if (affectedCustomers.length > 0) {
        for (const customer of affectedCustomers) {
          const messageBody = `Dear ${customer.name}, the medicine '${med.name}' (Batch: ${med.batch_number}) you purchased is expiring on ${med.expiry_date.toDateString()}. Please contact us. - MediStore`;
          let status = 'failed';
          let errorMessage = null;

          if (twilioClient && twilioPhoneNumber) {
            try {
              await twilioClient.messages.create({
                body: messageBody,
                from: twilioPhoneNumber,
                to: customer.mobile_number,
              });
              status = 'sent';
              console.log(`[Twilio SMS] Sent to: ${customer.mobile_number}`);
            } catch (error) {
              console.error(`[Twilio Error] Failed to send SMS to ${customer.mobile_number}:`, error.message);
              errorMessage = error.message;
            }
          } else {
            console.warn('[Twilio MOCK] Missing Twilio credentials. Message not sent to:', customer.mobile_number);
          }

          customerAlertStatuses.push({
            ...customer,
            alert_status: status,
            error: errorMessage,
          });
        }
      }

      return {
        medicine: med,
        affectedCustomers: customerAlertStatuses,
      };
    })
  );

  return NextResponse.json({ alerts: alertData });
}
