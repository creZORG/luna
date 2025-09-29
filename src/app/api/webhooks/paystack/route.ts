
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// This is your Paystack webhook handler.
//
// In your Paystack dashboard, you should set your webhook URL to:
// https://<your-domain>/api/webhooks/paystack
//
// For local testing, you can use a tool like ngrok to expose
// your local server to the internet.

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY is not set.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('x-paystack-signature');

  if (!signature) {
    return NextResponse.json({ message: 'No signature found.' }, { status: 400 });
  }

  // Verify the webhook signature
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    console.warn('Invalid Paystack webhook signature received.');
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
  }

  // The signature is valid, you can now process the event
  const event = JSON.parse(body);

  console.log(`Received Paystack event: ${event.event}`);

  // TODO: Handle the event
  //
  // For example, if event.event === 'charge.success':
  // - Check if you've already processed this transaction reference.
  // - If not, verify the transaction details with Paystack again.
  // - Fulfill the order (e.g., update order status to 'paid', send email, etc.).

  switch (event.event) {
    case 'charge.success':
      const { reference, amount, status } = event.data;
      console.log(`Payment successful for reference: ${reference}. Amount: ${amount / 100}. Status: ${status}`);
      // Add your business logic here.
      // E.g., find order by reference, update status.
      break;
    
    // Add other event handlers as needed
    // case 'transfer.success':
    //   // handle transfer success
    //   break;

    default:
      console.log(`Unhandled Paystack event type: ${event.event}`);
  }

  // Return a 200 OK response to acknowledge receipt of the event
  return NextResponse.json({ status: 'success' });
}
