import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface ActivityLog {
    id?: string;
    description: string;
    timestamp: any; // Firebase ServerTimestamp
    userId: string;
    userName: string;
}

class ActivityService {

    async logActivity(description: string, userId: string, userName: string): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "activities"), {
                description,
                userId,
                userName,
                timestamp: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Error logging activity:", error);
            // We don't throw an error here because logging is a non-critical background task.
            // The user's primary action should not fail if logging fails.
            return '';
        }
    }

    async getRecentActivities(count: number = 50): Promise<ActivityLog[]> {
        try {
            const q = query(
                collection(db, "activities"),
                orderBy("timestamp", "desc"),
                limit(count)
            );
            const querySnapshot = await getDocs(q);
            const activities: ActivityLog[] = [];
            querySnapshot.forEach((doc) => {
                activities.push({ id: doc.id, ...doc.data() } as ActivityLog);
            });
            return activities;
        } catch (error) {
            console.error("Error fetching recent activities:", error);
            throw new Error("Could not fetch recent activities.");
        }
    }
}

export const activityService = new ActivityService();
