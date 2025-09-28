
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { activityService } from './activity.service';

export interface CompanySettings {
    latitude: number;
    longitude: number;
    maxCheckInDistance: number;
}

const SETTINGS_DOC_ID = 'company';

class SettingsService {

    async getCompanySettings(): Promise<CompanySettings | null> {
        try {
            const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                return docSnap.data() as CompanySettings;
            }
            return null; // Return null if no settings are found
        } catch (error) {
            console.error("Error fetching company settings:", error);
            throw new Error("Could not fetch company settings.");
        }
    }

    async updateCompanySettings(settings: CompanySettings, userId: string, userName: string): Promise<void> {
        try {
            const settingsDocRef = doc(db, 'settings', SETTINGS_DOC_ID);
            const docSnap = await getDoc(settingsDocRef);

            if (docSnap.exists()) {
                await updateDoc(settingsDocRef, settings);
            } else {
                await setDoc(settingsDocRef, settings);
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
