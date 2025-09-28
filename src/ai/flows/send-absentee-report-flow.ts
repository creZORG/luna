
'use server';
/**
 * @fileOverview A flow to generate and send a daily absentee report to administrators.
 *
 * - sendAbsenteeReport - A function that finds absent employees and emails a report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { userService } from '@/services/user.service';
import { attendanceService } from '@/services/attendance.service';
import { sendEmail } from './send-email-flow';
import { format } from 'date-fns';
import { createEmailTemplate } from '@/lib/email-template';

// No input schema needed as the flow fetches all data it needs.
const AbsenteeReportInputSchema = z.null();

export async function sendAbsenteeReport() {
  return await sendAbsenteeReportFlow(null);
}

const sendAbsenteeReportFlow = ai.defineFlow(
  {
    name: 'sendAbsenteeReportFlow',
    inputSchema: AbsenteeReportInputSchema,
    outputSchema: z.void(),
  },
  async () => {
    // 1. Get all users who are supposed to check in
    const allUsers = await userService.getUsers();
    const relevantUsers = allUsers.filter(u =>
      u.roles.some(r => ['admin', 'sales', 'operations', 'finance', 'manufacturing', 'digital-marketing'].includes(r))
    );

    // 2. Get all attendance records for today
    const todaysRecords = await attendanceService.getTodaysAttendance();
    const checkedInUserIds = new Set(todaysRecords.map(rec => rec.userId));

    // 3. Find who is absent
    const absentUsers = relevantUsers.filter(user => !checkedInUserIds.has(user.uid));

    // 4. Get all admins to send the report to
    const admins = await userService.getAdmins();

    if (admins.length === 0) {
      console.log("No admins found to send absentee report.");
      return;
    }

    // 5. Construct and send the email
    const todayStr = format(new Date(), 'PPP');
    const subject = `Daily Absentee Report - ${todayStr}`;
    
    let body = `
      <p>Hello Admins,</p>
      <p>Please find the absentee report for ${todayStr}.</p>
    `;

    if (absentUsers.length > 0) {
      body += `
        <p>The following ${absentUsers.length} employee(s) did not check in today:</p>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse; border-color: #e2e8f0;">
          <thead style="background-color: #f8fafc;">
            <tr>
              <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Employee Name</th>
              <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Email</th>
              <th style="text-align: left; padding: 8px; border-color: #e2e8f0;">Roles</th>
            </tr>
          </thead>
          <tbody>
            ${absentUsers.map(user => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border-color: #e2e8f0;">${user.displayName}</td>
                <td style="padding: 8px; border-color: #e2e8f0;">${user.email}</td>
                <td style="padding: 8px; border-color: #e2e8f0;">${user.roles.join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      body += "<p>All employees have checked in today. Great job, team!</p>";
    }
    
    const emailHtml = createEmailTemplate(subject, body);

    // Send the email to each admin
    for (const admin of admins) {
      await sendEmail({
        to: { address: admin.email, name: admin.displayName },
        subject: subject,
        htmlbody: emailHtml,
      });
    }

    console.log(`Absentee report sent to ${admins.length} admin(s).`);
  }
);
