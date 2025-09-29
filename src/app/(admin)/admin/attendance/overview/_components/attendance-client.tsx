
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/user.service";
import { AttendanceRecord } from "@/services/attendance.service";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, AlertTriangle, Clock, Send, Loader, LogIn, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendAbsenteeReport } from "@/ai/flows/send-absentee-report-flow";
import { cn } from "@/lib/utils";

interface AttendanceClientProps {
    initialRecords: AttendanceRecord[];
    allUsers: UserProfile[];
}

interface UserAttendanceStatus {
    uid: string;
    displayName: string;
    email: string;
    status: 'Clocked In' | 'Absent' | 'Late' | 'Clocked Out';
    checkInTime: Date | null;
    checkOutTime: Date | null;
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
                const checkOutTime = record.checkOutTime ? (record.checkOutTime as any).toDate() : null;
                const isLate = checkInTime.getHours() >= LATE_THRESHOLD_HOUR;

                let status: UserAttendanceStatus['status'];
                if (checkOutTime) {
                    status = 'Clocked Out';
                } else if (isLate) {
                    status = 'Late';
                } else {
                    status = 'Clocked In';
                }

                return {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    status: status,
                    checkInTime: checkInTime,
                    checkOutTime: checkOutTime,
                };
            } else {
                return {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    status: 'Absent',
                    checkInTime: null,
                    checkOutTime: null,
                };
            }
        }).sort((a, b) => {
            if (a.status === b.status) return 0;
            const order = { 'Late': 1, 'Clocked In': 2, 'Absent': 3, 'Clocked Out': 4 };
            return order[a.status] - order[b.status];
        });
    }, [initialRecords, allUsers]);

    const presentCount = userStatuses.filter(u => u.status === 'Clocked In' || u.status === 'Late').length;
    const absentCount = userStatuses.filter(u => u.status === 'Absent').length;
    const lateCount = userStatuses.filter(u => u.status === 'Late').length;

    const getStatusBadge = (status: UserAttendanceStatus['status']) => {
        const variants = {
            'Clocked In': 'bg-green-600/80',
            'Late': 'bg-orange-500/80 text-black',
            'Absent': 'bg-destructive/80',
            'Clocked Out': 'bg-gray-400/80',
        };
        const icons = {
            'Clocked In': <LogIn className="mr-2 h-3.5 w-3.5"/>,
            'Late': <Clock className="mr-2 h-3.5 w-3.5"/>,
            'Absent': <AlertTriangle className="mr-2 h-3.5 w-3.5"/>,
            'Clocked Out': <LogOut className="mr-2 h-3.5 w-3.5"/>,
        };

        return (
            <Badge className={cn("capitalize", variants[status])}>
                {icons[status]}{status}
            </Badge>
        );
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
                        <CardTitle className="text-sm font-medium">Currently Clocked In</CardTitle>
                        <LogIn className="h-4 w-4 text-muted-foreground" />
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
                         <p className="text-xs text-muted-foreground">Have not checked in today</p>
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
                            <CardDescription>A list of all staff and their check-in/out status for today.</CardDescription>
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
                                <TableHead>Check-out Time</TableHead>
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
                                    <TableCell>
                                        {user.checkOutTime ? format(user.checkOutTime, 'p') : 'N/A'}
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
