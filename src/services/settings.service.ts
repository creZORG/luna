
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { activityService } from './activity.service';

export interface DeliveryZoneFees {
    nairobi: number;
    majorTowns: number;
    remote: number;
}
export interface CompanySettings {
    latitude: number;
    longitude: number;
    maxCheckInDistance: number;
    deliveryFees: DeliveryZoneFees;
}

const SETTINGS_DOC_ID = 'company';

class SettingsService {

    async getCompanySettings(): Promise<CompanySettings | null> {
        try {
            const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                // Provide defaults for deliveryFees if they don't exist
                const data = docSnap.data();
                if (!data.deliveryFees) {
                    data.deliveryFees = { nairobi: 0, majorTowns: 0, remote: 0 };
                }
                return data as CompanySettings;
            }
            return null; // Return null if no settings are found
        } catch (error) {
            console.error("Error fetching company settings:", error);
            throw new Error("Could not fetch company settings.");
        }
    }

    async updateCompanySettings(settings: Partial<CompanySettings>, userId: string, userName: string): Promise<void> {
        try {
            const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
            const docSnap = await getDoc(settingsDocRef);

            if (docSnap.exists()) {
                await updateDoc(settingsDocRef, settings);
            } else {
                // Ensure all fields are present for a new document
                const fullSettings: CompanySettings = {
                    latitude: settings.latitude ?? 0,
                    longitude: settings.longitude ?? 0,
                    maxCheckInDistance: settings.maxCheckInDistance ?? 100,
                    deliveryFees: settings.deliveryFees ?? { nairobi: 0, majorTowns: 0, remote: 0 },
                };
                await setDoc(settingsDocRef, fullSettings);
            }

            // Log this important action
            activityService.logActivity('Updated company-wide settings.', userId, userName);

        } catch (error) {
            console.error("Error updating company settings:", error);
            throw new Error("Could not update company settings.");
        }
    }
}

export const settingsService = new SettingsService();
