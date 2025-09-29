
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { activityService } from './activity.service';

export interface PickupLocation {
    id: string;
    name: string;
    address: string;
    operatingHours: string;
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

      activityService.logActivity(
        `Added new pickup location: ${locationData.name}`,
        userId,
        userName
      );

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
}

export const pickupLocationService = new PickupLocationService();
