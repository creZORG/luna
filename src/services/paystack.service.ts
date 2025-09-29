
import Paystack from 'paystack-node';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { orderService } from './order.service';

// This file is intentionally left almost empty.
// All Paystack logic has been moved directly into the Genkit flows
// to prevent client-side bundling of server-only dependencies.
// This service file remains for structural consistency but should not
// be used for new Paystack-related logic that could be called from the client.

class PaystackService {
    // This class is now a placeholder. The core logic is in the flows.
}

export const paystackService = new PaystackService();
