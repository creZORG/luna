

import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { userService } from './user.service';
import { format } from 'date-fns';
import { createEmailTemplate } from '@/lib/email-template';
import { logActivity } from './activity.service';

export interface SalesLog {
    productId: string;
    size: string;
    openingStock: number;
    qtyIssued: number;
    qtySold: number;
    qtyReturned: number;
    defects: number;
    date: any; // Firebase ServerTimestamp
    salespersonId: string;
    salespersonName: string;
}

export interface ReconciliationLog {
    itemId: string; // This is the composite ID, e.g., "productId-size"
    qtyIssued: number;
    qtyReturned: number;
    samples: number;
    defects: number;
    qtySold: number;
    date: any; // Firebase ServerTimestamp
    salespersonId: string;
    salespersonName: string;
    operatorId: string; // The Ops Manager who submitted the log
    operatorName: string;
}

class SalesService {
    async createSalesLogs(logs: Omit<SalesLog, 'date'|'salespersonId'|'salespersonName'>[], salespersonId: string, salespersonName: string): Promise<void> {
        try {
            const batch = writeBatch(db);
            logs.forEach(log => {
                const docRef = doc(collection(db, "salesLogs"));
                batch.set(docRef, { 
                    ...log, 
                    date: serverTimestamp(),
                    salespersonId,
                    salespersonName
                });
            });
            await batch.commit();

            // Notify admins
            const admins = await userService.getAdmins();
            const subject = `Daily Sales Log Submitted by ${salespersonName}`;
            const totalSold = logs.reduce((sum, log) => sum + log.qtySold, 0);

            let body = `
                <p>Hello Admins,</p>
                <p><strong>${salespersonName}</strong> has submitted their daily sales log for ${format(new Date(), 'PPP')}.</p>
                <h3>Summary</h3>
                <ul>
                    <li><strong>Total Units Sold:</strong> ${totalSold}</li>
                </ul>
                <p>Please review the detailed logs in the system.</p>
            `;
            const emailHtml = createEmailTemplate(subject, body);
            
            for (const admin of admins) {
                await sendEmail({
                    to: { address: admin.email, name: admin.displayName },
                    subject: subject,
                    htmlbody: emailHtml,
                });
            }

        } catch (e) {
            console.error("Error creating sales logs: ", e);
            throw new Error("Could not create sales logs");
        }
    }

    async createReconciliationLogs(
        logs: Omit<ReconciliationLog, 'date' | 'salespersonId' | 'salespersonName' | 'operatorId' | 'operatorName' | 'qtySold'>[], 
        salespersonId: string, 
        salespersonName: string,
        operatorId: string,
        operatorName: string
    ): Promise<void> {
        try {
            const batch = writeBatch(db);

            const logsWithCalculations = logs.map(log => {
                const qtySold = log.qtyIssued - log.qtyReturned - log.samples - log.defects;
                return { ...log, qtySold };
            });

            logsWithCalculations.forEach(log => {
                if (log.qtySold < 0) {
                    throw new Error(`Calculated quantity sold for item ${log.itemId} is negative. Please check the numbers.`);
                }
                const docRef = doc(collection(db, "reconciliationLogs"));
                batch.set(docRef, {
                    ...log,
                    date: serverTimestamp(),
                    salespersonId,
                    salespersonName,
                    operatorId,
                    operatorName
                });

                // Here you might want to adjust a salesperson-specific inventory
                // For now, we assume this log is the source of truth for the day's movements
            });

            await batch.commit();

             // Log activity
             logActivity(
                `Submitted stock reconciliation for ${salespersonName}.`,
                operatorId,
                operatorName
            );

        } catch (e) {
            console.error("Error creating reconciliation logs: ", e);
            throw new Error(`Could not create reconciliation logs: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
}

export const salesService = new SalesService();
