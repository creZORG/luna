
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { activityService } from './activity.service';

export interface PickupLocation {
    id: string;
    name: string;
    address: string;
    operatingHours: string;
    partnerId?: string;
    partnerName?: string;
}

class PickupLocationService {
  
  async createPickupLocation(
    locationData: Omit<PickupLocation, 'id'>, 
    userId: string, 
    userName: string
  ): Promise<PickupLocation> {
    try {
      const docRef = await addDoc(collection(db, 'pickupLocations'), {
        ...locationData,
        createdAt: serverTimestamp(),
      });

      let activityDescription = `Added new pickup location: ${locationData.name}`;
      if (locationData.partnerId && locationData.partnerName) {
        activityDescription += ` and assigned it to ${locationData.partnerName}.`;
      }

      activityService.logActivity(activityDescription, userId, userName);

      return { id: docRef.id, ...locationData };
    } catch (e) {
      console.error('Error adding pickup location: ', e);
      throw new Error('Could not create pickup location.');
    }
  }

  async getPickupLocations(): Promise<PickupLocation[]> {
    try {
      const q = query(
        collection(db, 'pickupLocations'),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const locations: PickupLocation[] = [];
      querySnapshot.forEach((doc) => {
        locations.push({ id: doc.id, ...doc.data() } as PickupLocation);
      });
      return locations;
    } catch (e) {
      console.error('Error fetching pickup locations: ', e);
      throw new Error('Could not fetch pickup locations.');
    }
  }

  async assignPartnerToLocation(locationId: string, partnerId: string, partnerName: string): Promise<void> {
      try {
        const locationRef = doc(db, 'pickupLocations', locationId);
        await updateDoc(locationRef, {
            partnerId: partnerId,
            partnerName: partnerName
        });
      } catch (error) {
         console.error("Error assigning partner:", error);
         throw new Error("Could not assign partner to the location.");
      }
  }
}

export const pickupLocationService = new PickupLocationService();
