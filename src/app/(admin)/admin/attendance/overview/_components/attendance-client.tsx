
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/user.service";
import { AttendanceRecord } from "@/services/attendance.service";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, AlertTriangle, Clock, Send, Loader } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendAbsenteeReport } from "@/ai/flows/send-absentee-report-flow";

interface AttendanceClientProps {
    initialRecords: AttendanceRecord[];
    allUsers: UserProfile[];
}

interface UserAttendanceStatus {
    uid: string;
    displayName: string;
    email: string;
    status: 'Present' | 'Absent' | 'Late';
    checkInTime: Date | null;
}

const LATE_THRESHOLD_HOUR = 9; // 9 AM

export default function AttendanceClient({ initialRecords, allUsers }: AttendanceClientProps) {
    const [isSendingReport, setIsSendingReport] = useState(false);
    const { toast } = useToast();

    const userStatuses = useMemo((): UserAttendanceStatus[] => {
        return allUsers.map(user => {
            const record = initialRecords.find(rec => rec.userId === user.uid);
            if (record) {
                const checkInTime = (record.checkInTime as any).toDate();
                const isLate = checkInTime.getHours() >= LATE_THRESHOLD_HOUR;
                return {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    status: isLate ? 'Late' : 'Present',
                    checkInTime: checkInTime,
                };
            } else {
                return {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    status: 'Absent',
                    checkInTime: null,
                };
            }
        }).sort((a, b) => {
            if (a.status === b.status) return 0;
            const order = { 'Present': 1, 'Late': 2, 'Absent': 3 };
            return order[a.status] - order[b.status];
        });
    }, [initialRecords, allUsers]);

    const presentCount = userStatuses.filter(u => u.status === 'Present' || u.status === 'Late').length;
    const absentCount = userStatuses.length - presentCount;
    const lateCount = userStatuses.filter(u => u.status === 'Late').length;

    const getStatusBadge = (status: UserAttendanceStatus['status']) => {
        switch (status) {
            case 'Present':
                return <Badge className="bg-green-600/80"><CheckCircle className="mr-2 h-3.5 w-3.5"/>Present</Badge>;
            case 'Late':
                return <Badge variant="destructive"><Clock className="mr-2 h-3.5 w-3.5"/>Late</Badge>;
            case 'Absent':
                return <Badge variant="secondary"><AlertTriangle className="mr-2 h-3.5 w-3.5"/>Absent</Badge>;
        }
    };
    
    const handleSendReport = async () => {
        setIsSendingReport(true);
        try {
            await sendAbsenteeReport();
            toast({
                title: 'Report Sent!',
                description: 'The daily absentee report has been emailed to all administrators.'
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error Sending Report',
                description: 'There was a problem generating or sending the absentee report.'
            });
            console.error('Failed to send absentee report:', error);
        } finally {
            setIsSendingReport(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-1">
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Staff</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentCount}</div>
                        <p className="text-xs text-muted-foreground">out of {userStatuses.length} total staff</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent Staff</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentCount}</div>
                         <p className="text-xs text-muted-foreground">As of now</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late Check-ins</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lateCount}</div>
                        <p className="text-xs text-muted-foreground">Checked in after {LATE_THRESHOLD_HOUR}:00 AM</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Today's Attendance Log</CardTitle>
                            <CardDescription>A list of all staff and their check-in status for today.</CardDescription>
                        </div>
                         <Button onClick={handleSendReport} disabled={isSendingReport}>
                            {isSendingReport ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Absentee Report
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Check-in Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userStatuses.map(user => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://i.pravatar.cc/40?u=${user.uid}`} alt={user.displayName} />
                                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>
                                        {user.checkInTime ? format(user.checkInTime, 'p') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
