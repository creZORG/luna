
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, runTransaction, serverTimestamp, writeBatch, query, orderBy, setDoc, updateDoc } from 'firebase/firestore';
import type { RawMaterial, RawMaterialIntake, UnitOfMeasure } from '@/lib/raw-materials.data';
import { userService } from './user.service';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';
import { activityService } from './activity.service';
import { uploadImageFlow } from '@/ai/flows/upload-image-flow';


export interface IntakeFormData {
    supplier: string;
    deliveryNoteId: string;
    rawMaterialId: string;
    quantityOnNote: number;
    actualQuantity: number;
    alkalinity: string;
    batchNumber: string;
    expiryDate: Date;
    deliveryNotePhoto: File;
}

export interface NewRawMaterialData {
    name: string;
    unitOfMeasure: UnitOfMeasure;
    quantity: number;
}

// Helper to convert File to Data URI
const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


class RawMaterialService {

    async getRawMaterials(): Promise<RawMaterial[]> {
        const q = query(collection(db, 'rawMaterials'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const materials: RawMaterial[] = [];
        querySnapshot.forEach((doc) => {
            materials.push({ id: doc.id, ...doc.data() } as RawMaterial);
        });
        return materials;
    }
    
    async createRawMaterial(data: NewRawMaterialData, userId: string, userName: string): Promise<string> {
        const docRef = await addDoc(collection(db, 'rawMaterials'), data);
        activityService.logActivity(`Created new raw material: ${data.name}.`, userId, userName);
        return docRef.id;
    }

    async updateRawMaterialQuantity(materialId: string, quantity: number, userId: string, userName: string): Promise<void> {
        const materialRef = doc(db, 'rawMaterials', materialId);
        await updateDoc(materialRef, { quantity });
        activityService.logActivity(`Updated inventory for material ID ${materialId} to ${quantity}.`, userId, userName);
    }

    async logIntakeAndupdateInventory(formData: IntakeFormData, userId: string): Promise<string> {
        // 1. Upload the photo
        const imageDataUri = await toDataUri(formData.deliveryNotePhoto);
        const deliveryNotePhotoUrl = await uploadImageFlow({
            imageDataUri: imageDataUri,
            folder: 'delivery-notes'
        });


        // 2. Create the intake log and update inventory in a transaction
        const intakeRef = doc(collection(db, 'rawMaterialIntakes'));
        const materialRef = doc(db, 'rawMaterials', formData.rawMaterialId);

        let materialName = 'Unknown Material';
        let userProfile = await userService.getUserProfile(userId);

        try {
            await runTransaction(db, async (transaction) => {
                const materialDoc = await transaction.get(materialRef);
                if (!materialDoc.exists()) {
                    throw "Raw material document does not exist!";
                }
                materialName = materialDoc.data().name;

                const newQuantity = (materialDoc.data().quantity || 0) + formData.actualQuantity;
                
                transaction.update(materialRef, { quantity: newQuantity });

                const intakeData: Omit<RawMaterialIntake, 'id'> = {
                    supplier: formData.supplier,
                    deliveryNoteId: formData.deliveryNoteId,
                    rawMaterialId: formData.rawMaterialId,
                    quantityOnNote: formData.quantityOnNote,
                    actualQuantity: formData.actualQuantity,
                    alkalinity: formData.alkalinity,
                    batchNumber: formData.batchNumber,
                    expiryDate: formData.expiryDate,
                    deliveryNotePhotoUrl: deliveryNotePhotoUrl,
                    receivedAt: serverTimestamp(),
                    receivedBy: userId,
                }
                transaction.set(intakeRef, intakeData);
            });
            
            // Log activity
            if (userProfile) {
                 activityService.logActivity(
                    `Logged intake of ${formData.actualQuantity} units of ${materialName} from ${formData.supplier}.`,
                    userId,
                    userProfile.displayName
                );
            }

            // 3. Check for discrepancy and send email if needed
            const discrepancy = formData.quantityOnNote - formData.actualQuantity;
            if (discrepancy !== 0) {
                const admins = await userService.getAdmins();
                const subject = `Alert: Delivery Discrepancy from ${formData.supplier}`;
                const body = `
                    <p>Hello Admins,</p>
                    <p>A discrepancy was noted during the raw material intake process from supplier <strong>${formData.supplier}</strong>, logged by ${userProfile?.displayName}.</p>
                    <ul>
                        <li>Material: ${materialName}</li>
                        <li>Quantity on Delivery Note: ${formData.quantityOnNote}</li>
                        <li>Actual Quantity Received: ${formData.actualQuantity}</li>
                        <li><strong>Discrepancy: ${discrepancy.toFixed(2)}</strong></li>
                    </ul>
                    <p>This may require a follow-up with the supplier. The delivery note number is ${formData.deliveryNoteId}.</p>
                `;
                const emailHtml = createEmailTemplate(subject, body);
                for (const admin of admins) {
                    await sendEmail({
                        to: { address: admin.email, name: admin.displayName },
                        subject: subject,
                        htmlbody: emailHtml,
                    });
                }
            }

            return intakeRef.id;
        } catch (e) {
            console.error("Transaction or email notification failed: ", e);
            throw new Error("Failed to log intake and update inventory.");
        }
    }


    // SEED FUNCTION: To be run once to populate the rawMaterials collection
    async seedRawMaterials(materials: Omit<RawMaterial, 'id' | 'quantity'>[]): Promise<void> {
        const collectionRef = collection(db, "rawMaterials");
        const snapshot = await getDocs(collectionRef);
        if (!snapshot.empty) {
            console.log("Raw materials collection already has documents. Skipping seed.");
            return;
        }

        const batch = writeBatch(db);
        materials.forEach(material => {
            const docRef = doc(collectionRef);
            const newMaterial: Omit<RawMaterial, 'id'> = {
                ...material,
                quantity: 0, // All materials start with 0 quantity
            };
            batch.set(docRef, newMaterial);
        });

        await batch.commit();
        console.log("Successfully seeded raw materials inventory.");
    }
}

export const rawMaterialService = new RawMaterialService();
