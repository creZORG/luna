

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, increment, getDoc, orderBy, setDoc } from 'firebase/firestore';
import type { ReferralLink } from '@/lib/referrals.data';
import { logActivity } from './activity.service';
import { customAlphabet } from 'nanoid';

// Using a custom alphabet for friendlier short URLs
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

class ReferralService {

    async createReferralLink(destinationUrl: string, marketerId: string, marketerName: string, campaignId?: string, campaignName?: string): Promise<ReferralLink> {
        const shortCode = nanoid();
        
        const newLink: Omit<ReferralLink, 'id'> = {
            destinationUrl,
            campaignId,
            campaignName,
            marketerId,
            marketerName,
            clickCount: 0,
            createdAt: serverTimestamp(),
            shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/r/${shortCode}`,
        };

        const docRef = doc(db, "referrals", shortCode);
        await setDoc(docRef, newLink);

        logActivity(
            `Created a new referral link for campaign: ${campaignName || 'General'}`,
            marketerId,
            marketerName
        );

        return { id: shortCode, ...newLink } as ReferralLink;
    }

    async getReferralLinksByMarketer(marketerId: string): Promise<ReferralLink[]> {
        const q = query(
            collection(db, "referrals"),
            where("marketerId", "==", marketerId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const links: ReferralLink[] = [];
        querySnapshot.forEach((doc) => {
            links.push({ id: doc.id, ...doc.data() } as ReferralLink);
        });
        return links;
    }
    
    async getReferralLinksByCampaign(campaignId: string): Promise<ReferralLink[]> {
        const q = query(
            collection(db, "referrals"),
            where("campaignId", "==", campaignId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const links: ReferralLink[] = [];
        querySnapshot.forEach((doc) => {
            links.push({ id: doc.id, ...doc.data() } as ReferralLink);
        });
        return links;
    }

    async getAndTrackReferral(shortCode: string): Promise<ReferralLink | null> {
        const docRef = doc(db, "referrals", shortCode);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        // Atomically increment the click count without a transaction
        await updateDoc(docRef, {
            clickCount: increment(1)
        });

        return { id: docSnap.id, ...docSnap.data() } as ReferralLink;
    }
}

export const referralService = new ReferralService();
