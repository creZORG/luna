import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc, runTransaction, increment } from 'firebase/firestore';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { userService } from './user.service';
import { format } from 'date-fns';
import { createEmailTemplate } from '@/lib/email-template';
import { activityService } from './activity.service';

export interface SalesLog {
    productId: string;
    size: string;
    openingStock: number;
    qtyIssued: number;
    qtySold: number;
    qtyReturned: number;
    defects: number;
    date: any; // Using 'any' for Firebase ServerTimestamp
    salespersonId: string;
    salespersonName: string;
}

class SalesService {
    async createSalesLogs(salesLogs: Omit<SalesLog, 'date' | 'salespersonId' | 'salespersonName'>[], salespersonId: string, salespersonName: string): Promise<void> {
        try {
            const batch = writeBatch(db);

            salesLogs.forEach(log => {
                const docRef = doc(collection(db, "sales"));
                batch.set(docRef, {
                    ...log,
                    date: serverTimestamp(),
                    salespersonId,
                    salespersonName,
                });
                
                // Update inventory
                const closingStock = log.openingStock + log.qtyIssued - log.qtySold - log.qtyReturned - log.defects;
                const inventoryId = `${log.productId}-${log.size.replace(/\s/g, '')}`;
                const inventoryRef = doc(db, 'inventory', inventoryId);
                batch.set(inventoryRef, { quantity: closingStock }, { merge: true });
            });

            await batch.commit();

             // Log activity
            const totalSoldForLog = salesLogs.reduce((sum, log) => sum + log.qtySold, 0);
             activityService.logActivity(
                `Submitted daily sales log with ${totalSoldForLog} units sold.`,
                salespersonId,
                salespersonName
            );

            // Send summary email to admins
            const admins = await userService.getAdmins();
            const totalSold = salesLogs.reduce((sum, log) => sum + log.qtySold, 0);
            const totalDefects = salesLogs.reduce((sum, log) => sum + log.defects, 0);
            const subject = `Daily Sales Summary: ${salespersonName} - ${format(new Date(), 'PPP')}`;
            
            let body = `
                <p>Hello Admins,</p>
                <p>Here is the end-of-day sales summary submitted by <strong>${salespersonName}</strong>.</p>
                <h3>Summary</h3>
                <ul>
                    <li><strong>Total Units Sold:</strong> ${totalSold}</li>
                    <li><strong>Total Defects Reported:</strong> ${totalDefects}</li>
                </ul>
                <h3>Detailed Breakdown:</h3>
                <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse; border-color: #e2e8f0;">
                    <thead style="background-color: #f8fafc;">
                        <tr>
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Product</th>
                             <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Opening</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Issued</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Sold</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Returned</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Defects</th>
                            <th style="text-align: right; padding: 8px; border-color: #e2e8f0;">Closing</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            const products = await Promise.all(salesLogs.map(l => userService.getProduct(l.productId)));

            salesLogs.forEach((log, index) => {
                const productName = products[index]?.name || 'Unknown Product';
                const closingStock = log.openingStock + log.qtyIssued - log.qtySold - log.qtyReturned - log.defects;
                body += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px; border-color: #e2e8f0;">${productName} (${log.size})</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.openingStock}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.qtyIssued}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.qtySold}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.qtyReturned}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0;">${log.defects}</td>
                        <td style="text-align: right; padding: 8px; border-color: #e2e8f0; font-weight: bold;">${closingStock}</td>
                    </tr>
                `;
            });
            body += `</tbody></table>`;
            const emailHtml = createEmailTemplate(subject, body);

             for (const admin of admins) {
                await sendEmail({
                    to: { address: admin.email, name: admin.displayName },
                    subject: subject,
                    htmlbody: emailHtml,
                });
            }

        } catch (e) {
            console.error("Error creating sales logs or sending email: ", e);
            throw new Error("Could not create sales logs");
        }
    }
}


export const salesService = new SalesService();
