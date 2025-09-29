

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import type { Campaign } from '@/lib/campaigns.data';
import { activityService } from './activity.service';

interface CreateCampaignData {
    name: string;
    promoCode: string;
    marketerId: string;
    marketerName: string;
}

class CampaignService {

    async createCampaign(data: CreateCampaignData, adminId: string, adminName: string): Promise<Campaign> {
        // Check if promo code already exists
        const existingCodeQuery = query(collection(db, "campaigns"), where("promoCode", "==", data.promoCode));
        const existingCodeSnapshot = await getDocs(existingCodeQuery);
        if (!existingCodeSnapshot.empty) {
            throw new Error(`Promo code "${data.promoCode}" already exists. Please choose another one.`);
        }
        
        const newCampaign: Omit<Campaign, 'id'> = {
            name: data.name,
            promoCode: data.promoCode,
            marketerId: data.marketerId,
            marketerName: data.marketerName,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "campaigns"), newCampaign);

        activityService.logActivity(
            `Created a new campaign: ${data.name} and assigned it to ${data.marketerName}`,
            adminId,
            adminName
        );

        return { id: docRef.id, ...newCampaign } as Campaign;
    }

    async getCampaigns(): Promise<Campaign[]> {
        const q = query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const campaigns: Campaign[] = [];
        querySnapshot.forEach((doc) => {
            campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
        });
        return campaigns;
    }
    
    async getCampaignsByMarketer(marketerId: string): Promise<Campaign[]> {
        const q = query(collection(db, "campaigns"), where("marketerId", "==", marketerId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const campaigns: Campaign[] = [];
        querySnapshot.forEach((doc) => {
            campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
        });
        return campaigns;
    }

    async validatePromoCode(promoCode: string): Promise<boolean> {
         const q = query(collection(db, "campaigns"), where("promoCode", "==", promoCode));
         const snapshot = await getDocs(q);
         return !snapshot.empty;
    }
}

export const campaignService = new CampaignService();
