
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore';
import { activityService } from './activity.service';

export interface AttendanceRecord {
    id?: string;
    userId: string;
    userName: string;
    checkInTime: any; // Firebase Timestamp
    location: {
        latitude: number;
        longitude: number;
    };
}

export interface TodayAttendanceStatus {
    hasCheckedIn: boolean;
    checkInTime: Date | null;
}

class AttendanceService {

    async logAttendance(userId: string, userName:string, location: { latitude: number, longitude: number }): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "attendance"), {
                userId,
                userName,
                checkInTime: serverTimestamp(),
                location
            });

            // Log activity
            activityService.logActivity('Checked in for the day.', userId, userName);

            return docRef.id;
        } catch (e) {
            console.error("Error adding attendance document: ", e);
            throw new Error("Could not log attendance");
        }
    }

    async getTodayAttendanceStatus(userId: string): Promise<TodayAttendanceStatus> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

        const q = query(
            collection(db, "attendance"),
            where("userId", "==", userId),
            where("checkInTime", ">=", Timestamp.fromDate(today)),
            where("checkInTime", "<", Timestamp.fromDate(tomorrow))
        );

        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                return {
                    hasCheckedIn: true,
                    checkInTime: (data.checkInTime as Timestamp).toDate()
                };
            }
            return { hasCheckedIn: false, checkInTime: null };
        } catch (error) {
            console.error("Error fetching today's attendance:", error);
            throw new Error("Could not verify attendance status.");
        }
    }

    async getTodaysAttendance(): Promise<AttendanceRecord[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const q = query(
            collection(db, "attendance"),
            where("checkInTime", ">=", Timestamp.fromDate(today)),
            where("checkInTime", "<", Timestamp.fromDate(tomorrow))
        );

        try {
            const querySnapshot = await getDocs(q);
            const records: AttendanceRecord[] = [];
            querySnapshot.forEach(doc => {
                records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
            });
            return records.sort((a,b) => a.checkInTime.seconds - b.checkInTime.seconds);
        } catch (error) {
            console.error("Error fetching today's attendance records:", error);
            throw new Error("Could not fetch today's attendance records.");
        }
    }
}

export const attendanceService = new AttendanceService();
