
'use server';

import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
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
    async createSalesLogs(salesLogs: Omit<SalesLog, 'date' | 'salespersonId' | 'salespersonName'>[]): Promise<void> {
        try {
            const user = await userService.getUserProfile("temp-salesperson-id"); // In real app, get from auth
            if (!user) throw new Error("Salesperson profile not found");
            
            const salespersonId = user.uid;
            const salespersonName = user.displayName;

            const batch = writeBatch(db);

            salesLogs.forEach(log => {
                const docRef = doc(collection(db, "sales"));
                batch.set(docRef, {
                    ...log,
                    date: serverTimestamp(),
                    salespersonId,
                    salespersonName,
                });
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
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Product ID</th>
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Size</th>
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Issued</th>
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Sold</th>
                            <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Defects</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            salesLogs.forEach(log => {
                body += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 8px; border-color: #e2e8f0;">${log.productId}</td>
                        <td style="padding: 8px; border-color: #e2e8f0;">${log.size}</td>
                        <td style="padding: 8px; border-color: #e2e8f0;">${log.qtyIssued}</td>
                        <td style="padding: 8px; border-color: #e2e8f0;">${log.qtySold}</td>
                        <td style="padding: 8px; border-color: #e2e8f0;">${log.defects}</td>
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
