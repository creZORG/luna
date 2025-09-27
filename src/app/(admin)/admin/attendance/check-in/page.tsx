
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { attendanceService, TodayAttendanceStatus } from '@/services/attendance.service';
import { Loader, MapPin, AlertCircle, CheckCircle, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { COMPANY_LOCATION, MAX_CHECK_IN_DISTANCE_METERS } from '@/lib/config';

// Haversine formula to calculate distance between two lat/lon points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

export default function CheckInPage() {
    const { toast } = useToast();
    const { user, userProfile } = useAuth();

    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [isWithinRange, setIsWithinRange] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<TodayAttendanceStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    useEffect(() => {
        if (user) {
            // Check if user has already checked in today
            const checkStatus = async () => {
                try {
                    const status = await attendanceService.getTodayAttendanceStatus(user.uid);
                    setAttendanceStatus(status);
                    if (!status.hasCheckedIn) {
                        // If not checked in, get current location
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords;
                                setLocation({ latitude, longitude });
                                const dist = getDistance(latitude, longitude, COMPANY_LOCATION.latitude, COMPANY_LOCATION.longitude);
                                setDistance(dist);
                                setIsWithinRange(dist <= MAX_CHECK_IN_DISTANCE_METERS);
                                setError(null);
                            },
                            (err) => {
                                switch (err.code) {
                                    case err.PERMISSION_DENIED:
                                        setError("Location access was denied. Please enable it in your browser settings to check in.");
                                        break;
                                    case err.POSITION_UNAVAILABLE:
                                        setError("Location information is unavailable.");
                                        break;
                                    case err.TIMEOUT:
                                        setError("The request to get user location timed out.");
                                        break;
                                    default:
                                        setError("An unknown error occurred while getting location.");
                                        break;
                                }
                            }
                        );
                    }
                } catch (e) {
                    toast({ variant: 'destructive', title: "Error", description: "Could not verify today's attendance status." });
                } finally {
                    setIsLoadingStatus(false);
                }
            };
            checkStatus();
        }
    }, [user, toast]);

    const handleCheckIn = async () => {
        if (!location || !user || !userProfile) return;

        setIsSubmitting(true);
        try {
            await attendanceService.logAttendance(user.uid, userProfile.displayName, location);
            toast({
                title: 'Check-in Successful!',
                description: `Welcome! Your attendance for ${format(new Date(), 'PPP')} has been logged.`,
            });
            const status = await attendanceService.getTodayAttendanceStatus(user.uid);
            setAttendanceStatus(status);
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Check-in Failed',
                description: 'There was a problem logging your attendance. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStatus = () => {
        if (isLoadingStatus) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <Loader className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying your attendance status for today...</p>
                </div>
            );
        }

        if (attendanceStatus?.hasCheckedIn) {
            return (
                 <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 !text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-300">Already Checked In!</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                        You successfully checked in today at {format(attendanceStatus.checkInTime!, 'p')}. Have a productive day!
                    </AlertDescription>
                </Alert>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Location Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (!location) {
             return (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <Loader className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Getting your location to verify you're at the office...</p>
                    <p className="text-xs text-muted-foreground/80">Please allow location access when prompted.</p>
                </div>
            );
        }

        return (
            <div className='space-y-6'>
                {isWithinRange ? (
                     <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <MapPin className="h-4 w-4 !text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Location Verified</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                           You are within the office premises. You can now check in.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <Ban className="h-4 w-4" />
                        <AlertTitle>Out of Range</AlertTitle>
                        <AlertDescription>
                            You must be within {MAX_CHECK_IN_DISTANCE_METERS} meters of the office to check in. You are currently approximately {distance?.toFixed(0)} meters away.
                        </AlertDescription>
                    </Alert>
                )}

                <Button 
                    onClick={handleCheckIn} 
                    disabled={!isWithinRange || isSubmitting} 
                    className="w-full"
                    size="lg"
                >
                    {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                    Confirm Check-in for {format(new Date(), 'PPP')}
                </Button>
            </div>
        );

    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <div className='flex justify-center mb-4'>
                        <MapPin className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Daily Attendance Check-in</CardTitle>
                    <CardDescription>
                        Verify your location to log your attendance for today.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   {renderStatus()}
                </CardContent>
            </Card>
        </div>
    );
}
