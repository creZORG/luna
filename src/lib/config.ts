
import { settingsService } from '@/services/settings.service';

// This file now acts as a dynamic configuration provider.
// It fetches settings from the database.

// Set default values in case the database is not yet populated.
const DEFAULTS = {
    latitude: -1.1718,
    longitude: 36.9530,
    maxDistance: 100,
};


export async function getCompanySettings() {
    try {
        const settings = await settingsService.getCompanySettings();
        return {
            COMPANY_LOCATION: {
                latitude: settings?.latitude ?? DEFAULTS.latitude,
                longitude: settings?.longitude ?? DEFAULTS.longitude,
            },
            MAX_CHECK_IN_DISTANCE_METERS: settings?.maxCheckInDistance ?? DEFAULTS.maxDistance,
        };
    } catch (error) {
        console.error("Could not fetch company settings, using defaults.", error);
        return {
            COMPANY_LOCATION: {
                latitude: DEFAULTS.latitude,
                longitude: DEFAULTS.longitude,
            },
            MAX_CHECK_IN_DISTANCE_METERS: DEFAULTS.maxDistance,
        };
    }
}
