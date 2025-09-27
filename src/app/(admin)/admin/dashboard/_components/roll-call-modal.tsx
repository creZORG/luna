
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CalendarCheck,
  Coffee,
  Loader,
  MapPin,
  AlertCircle,
  CheckCircle,
  Ban,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { attendanceService } from '@/services/attendance.service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// --- Configuration ---
const OFFICE_LOCATION = {
  latitude: -1.1718, // Ruiru, Kenya Latitude
  longitude: 36.953, // Ruiru, Kenya Longitude
};
const MAX_DISTANCE_METERS = 100; // 100 meters radius
// --------------------

// Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = (lat2 - lat1) * Math.PI) / 180;
  const Δλ = (lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

type ModalState = 'initial' | 'locating' | 'in_range' | 'out_of_range' | 'submitting' | 'error';

interface RollCallModalProps {
  isOpen: boolean;
  onClockInSuccess: () => void;
  onDayOff: () => void;
}

export function RollCallModal({ isOpen, onClockInSuccess, onDayOff }: RollCallModalProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>('initial');
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const startClockInProcess = () => {
    setModalState('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        const dist = getDistance(latitude, longitude, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);
        setDistance(dist);
        if (dist <= MAX_DISTANCE_METERS) {
          setModalState('in_range');
        } else {
          setModalState('out_of_range');
        }
        setLocationError(null);
      },
      (err) => {
        let message = 'An unknown error occurred while getting location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location access denied. Please enable it in browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            message = 'Request to get user location timed out.';
            break;
        }
        setLocationError(message);
        setModalState('error');
      }
    );
  };

  const handleConfirmCheckIn = async () => {
    if (!location || !user || !userProfile) return;

    setModalState('submitting');
    try {
      await attendanceService.logAttendance(user.uid, userProfile.displayName, location);
      toast({
        title: 'Check-in Successful!',
        description: `Welcome! Your attendance for ${format(new Date(), 'PPP')} has been logged.`,
      });
      onClockInSuccess();
      // Reset state for next time modal opens
      setTimeout(() => setModalState('initial'), 500); 
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Check-in Failed',
        description: 'There was a problem logging your attendance. Please try again.',
      });
      setModalState('error');
      setLocationError('Could not save attendance data. Please contact support.');
    }
  };
  
  const handleTryAgain = () => {
    setLocationError(null);
    setDistance(null);
    setLocation(null);
    setModalState('initial');
  }

  const renderContent = () => {
    switch (modalState) {
      case 'locating':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <Loader className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Getting your location...</p>
            <p className="text-xs text-muted-foreground/80">Please allow location access when prompted.</p>
          </div>
        );
      case 'in_range':
        return (
          <div className="space-y-4">
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <MapPin className="h-4 w-4 !text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-300">Location Verified</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                You are within office premises. Ready to check in.
              </AlertDescription>
            </Alert>
            <Button onClick={handleConfirmCheckIn} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Confirm Check-in
            </Button>
          </div>
        );
      case 'out_of_range':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <Ban className="h-4 w-4" />
              <AlertTitle>Out of Range</AlertTitle>
              <AlertDescription>
                You must be within {MAX_DISTANCE_METERS}m of the office. You are ~{distance?.toFixed(0)}m away.
              </AlertDescription>
            </Alert>
            <Button onClick={handleTryAgain} className="w-full" variant="outline">Try Again</Button>
          </div>
        );
      case 'submitting':
        return (
           <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <Loader className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Confirming your check-in...</p>
          </div>
        );
      case 'error':
        return (
           <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
            <Button onClick={handleTryAgain} className="w-full" variant="outline">Try Again</Button>
          </div>
        );
      case 'initial':
      default:
        return (
          <>
            <DialogHeader className="text-center items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <CalendarCheck className="w-10 h-10 text-primary" />
              </div>
              <DialogTitle className="text-2xl">Daily Roll Call</DialogTitle>
              <DialogDescription>
                Good morning! Please clock in to log your attendance for today or take the day off.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" onClick={onDayOff}>
                <Coffee className="mr-2" />
                Take a Day Off
              </Button>
              <Button size="lg" onClick={startClockInProcess}>
                <CalendarCheck className="mr-2" />
                Clock In Now
              </Button>
            </DialogFooter>
          </>
        );
    }
  };


  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[425px]"
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

    