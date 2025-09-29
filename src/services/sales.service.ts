
import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { userService } from './user.service';
import { format } from 'date-fns';
import { createEmailTemplate } from '@/lib/email-template';
import { activityService } from './activity.service';
import { storeItemService } from './store-item.service';

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
             activityService.logActivity(
                `Submitted stock reconciliation for ${salespersonName}.`,
                operatorId,
                operatorName
            );

            // Send summary email to admins and the salesperson
            const admins = await userService.getAdmins();
            const salesperson = await userService.getUserProfile(salespersonId);
            const recipients = [...admins];
            if (salesperson && !admins.some(a => a.uid === salesperson.uid)) {
                recipients.push(salesperson);
            }
            
            const totalSold = logsWithCalculations.reduce((sum, log) => sum + log.qtySold, 0);
            const subject = `Daily Reconciliation for ${salespersonName} - ${format(new Date(), 'PPP')}`;
            
            const allItems = await storeItemService.getStoreItems();
            const itemMap = new Map(allItems.map(i => [i.id, i.name]));

            let body = `
                <p>Hello,</p>
                <p><strong>${operatorName}</strong> has submitted the end-of-day stock reconciliation for <strong>${salespersonName}</strong>.</p>
                <h3>Summary</h3>
                <ul>
                    <li><strong>Total Units Sold:</strong> ${totalSold}</li>
                </ul>
                <h3>Detailed Breakdown:</h3>
                <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse; border-color: #e2e8f0;">
                    <thead style="background-color: #f8fafc;">
                        <tr>
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Product</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Issued</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Returned</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Samples</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Defects</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0; font-weight: bold;">Sold</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            logsWithCalculations.forEach((log) => {
                const itemName = itemMap.get(log.itemId) || 'Unknown Item';
                body += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px; border-color: #e2e8f0;">${itemName}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.qtyIssued}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.qtyReturned}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.samples}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.defects}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0; font-weight: bold;">${log.qtySold}</td>
                    </tr>
                `;
            });
            body += `</tbody></table>`;
            const emailHtml = createEmailTemplate(subject, body);

             for (const recipient of recipients) {
                await sendEmail({
                    to: { address: recipient.email, name: recipient.displayName },
                    subject: subject,
                    htmlbody: emailHtml,
                });
            }

        } catch (e) {
            console.error("Error creating reconciliation logs or sending email: ", e);
            throw new Error(`Could not create reconciliation logs: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
}

export const salesService = new SalesService();

    