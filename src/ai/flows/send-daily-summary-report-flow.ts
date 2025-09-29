
'use server';
/**
 * @fileOverview A flow to generate and send a detailed daily summary report to administrators.
 *
 * - sendDailySummaryReport - A function that compiles and emails the daily business summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { userService } from '@/services/user.service';
import { analyticsService } from '@/services/analytics.service';
import { sendEmail } from './send-email-flow';
import { format } from 'date-fns';
import { createEmailTemplate } from '@/lib/email-template';

const DailySummaryInputSchema = z.null();

export async function sendDailySummaryReport() {
  return await sendDailySummaryReportFlow(null);
}

const sendDailySummaryReportFlow = ai.defineFlow(
  {
    name: 'sendDailySummaryReportFlow',
    inputSchema: DailySummaryInputSchema,
    outputSchema: z.void(),
  },
  async () => {
    // 1. Get all admins to send the report to
    const admins = await userService.getAdmins();
    if (admins.length === 0) {
      console.log("No admins found to send daily summary report.");
      return;
    }

    // 2. Fetch all necessary analytics data for today
    const data = await analyticsService.getDashboardAnalytics(); // Re-use the dashboard analytics logic
    
    // 3. Construct the email
    const todayStr = format(new Date(), 'PPP');
    const subject = `Daily Business Summary - ${todayStr}`;

    const body = `
        <p>Hello Admins,</p>
        <p>Here is the business summary for ${todayStr}.</p>
        
        <h3>High-Level Metrics</h3>
        <table border="0" cellpadding="10" cellspacing="0" style="width:100%; text-align:center; margin-bottom: 20px;">
            <tr>
                <td style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 14px; color: #64748b;">Total Revenue</div>
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b;">Ksh ${data.totalRevenue.toLocaleString()}</div>
                </td>
                <td style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 14px; color: #64748b;">Total Orders</div>
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${data.totalOrders.toLocaleString()}</div>
                </td>
                <td style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 14px; color: #64748b;">Avg. Order Value</div>
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b;">Ksh ${data.averageOrderValue.toFixed(2)}</div>
                </td>
            </tr>
        </table>
        
        <h3>Top 5 Performing Products</h3>
        ${data.topProducts.length > 0 ? `
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; border-color: #e2e8f0;">
          <thead style="background-color: #f8fafc;">
            <tr>
              <th style="text-align: left;">Product</th>
              <th style="text-align: right;">Revenue</th>
              <th style="text-align: right;">Orders</th>
            </tr>
          </thead>
          <tbody>
            ${data.topProducts.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td style="text-align: right;">Ksh ${p.totalRevenue?.toLocaleString() ?? 0}</td>
                    <td style="text-align: right;">${p.orderCount?.toLocaleString() ?? 0}</td>
                </tr>
            `).join('')}
          </tbody>
        </table>` : '<p>No product sales data for today.</p>'}

        <h3 style="margin-top: 20px;">Top 5 Performing Salespeople</h3>
         ${data.topSalespeople.length > 0 ? `
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; border-color: #e2e8f0;">
          <thead style="background-color: #f8fafc;">
            <tr>
              <th style="text-align: left;">Salesperson</th>
              <th style="text-align: right;">Revenue</th>
              <th style="text-align: right;">Orders</th>
            </tr>
          </thead>
          <tbody>
            ${data.topSalespeople.map(s => `
                <tr>
                    <td>${s.name}</td>
                    <td style="text-align: right;">Ksh ${s.totalRevenue.toLocaleString()}</td>
                    <td style="text-align: right;">${s.orderCount}</td>
                </tr>
            `).join('')}
          </tbody>
        </table>` : '<p>No salesperson data for today.</p>'}
        
        <p style="margin-top: 20px;">This is an automated report. For more detailed analytics, please visit the admin dashboard.</p>
    `;

    const emailHtml = createEmailTemplate(subject, body);
    
    // 4. Send the email to each admin
    for (const admin of admins) {
      await sendEmail({
        to: { address: admin.email, name: admin.displayName },
        subject: subject,
        htmlbody: emailHtml,
      });
    }
    
    console.log(`Daily summary report sent to ${admins.length} admin(s).`);
  }
);
