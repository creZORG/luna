
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Shapes, DollarSign, Users, ArrowUpRight, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardService, DashboardData } from '@/services/dashboard.service';
import { Skeleton } from '@/components/ui/skeleton';
import { RollCallModal } from './_components/roll-call-modal';
import { useAuth } from '@/hooks/use-auth';
import { attendanceService } from '@/services/attendance.service';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const chartConfig = {
    count: {
      label: 'Products',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRollCall, setShowRollCall] = useState(false);
    const { user, userProfile } = useAuth();
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await dashboardService.getDashboardData();
                setData(dashboardData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        const checkRollCall = async () => {
            if (user && userProfile && userProfile.roles.includes('admin')) {
                const lastDismissed = localStorage.getItem('rollCallDismissed');
                if (lastDismissed === todayStr) {
                    return; // Already dismissed today
                }

                const status = await attendanceService.getTodayAttendanceStatus(user.uid);
                if (!status.hasCheckedIn) {
                    setShowRollCall(true);
                }
            }
        }

        fetchData();
        checkRollCall();
    }, [user, userProfile, todayStr]);

    const handleDayOff = () => {
        localStorage.setItem('rollCallDismissed', todayStr);
        setShowRollCall(false);
    };

    const handleClockInSuccess = () => {
        setShowRollCall(false);
    };


    if (loading || !data) {
        return (
            <>
                <RollCallModal isOpen={showRollCall} onClockInSuccess={handleClockInSuccess} onDayOff={handleDayOff} />
                 <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                             <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent></Card>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                        </Card>
                         <Card className="lg:col-span-3">
                            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                            <CardContent className="space-y-4">
                                {[...Array(5)].map((_,i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div>)}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        )
    }

    const { totalSales, totalOrders, recentOrders, recentActivities, totalProducts, totalCategories, productsPerCategory } = data;

    return (
        <>
            <RollCallModal isOpen={showRollCall} onClockInSuccess={handleClockInSuccess} onDayOff={handleDayOff} />
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Ksh {totalSales.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">From {totalOrders} orders</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Orders
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">+{totalOrders}</div>
                         <p className="text-xs text-muted-foreground">Total orders placed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Product Variants
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {totalCategories} categories
                        </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Staff
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 since last month
                        </p>
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>A list of the latest 5 orders.</CardDescription>
                            </div>
                            <Button asChild size="sm" className="ml-auto gap-1">
                                <Link href="/admin/orders">View All <ArrowUpRight className="h-4 w-4" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">{order.customerEmail}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge className="text-xs" variant="outline">{order.status}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {format(order.orderDate.toDate(), 'PPpp')}
                                        </TableCell>
                                        <TableCell className="text-right">Ksh {order.totalAmount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                         <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>What your team has been up to.</CardDescription>
                            </div>
                            <Button asChild size="sm" className="ml-auto gap-1">
                                <Link href="/admin/activities">View All <Activity className="h-4 w-4" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {recentActivities.map(activity => (
                                <div key={activity.id} className="flex items-center gap-4">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${activity.userId}`} alt="Avatar" />
                                        <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">{activity.userName}</p>
                                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
