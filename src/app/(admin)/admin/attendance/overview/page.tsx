
import { attendanceService } from "@/services/attendance.service";
import { userService } from "@/services/user.service";
import AttendanceClient from "./_components/attendance-client";


export default async function AttendanceOverviewPage() {
    const allUsers = await userService.getUsers();
    const attendanceRecords = await attendanceService.getTodaysAttendance();

    // Filter to only include users with roles that require attendance
    const relevantUsers = allUsers.filter(u => u.roles.some(r => ['admin', 'sales', 'operations', 'finance', 'manufacturing', 'digital-marketing'].includes(r)));

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Daily Attendance Overview</h1>
                <p className="text-muted-foreground">A real-time log of staff check-ins for today.</p>
            </div>
            <AttendanceClient initialRecords={attendanceRecords} allUsers={relevantUsers} />
        </div>
    );
}

