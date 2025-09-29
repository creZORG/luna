
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { pickupLocationService, PickupLocation } from '@/services/pickup-location.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PickupLocationsClientProps {
  initialLocations: PickupLocation[];
}

export default function PickupLocationsClient({ initialLocations }: PickupLocationsClientProps) {
  const [locations, setLocations] = useState(initialLocations);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [newLocationHours, setNewLocationHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const handleAddLocation = async () => {
    if (!newLocationName || !newLocationAddress || !newLocationHours) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields for the new location.' });
      return;
    }
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'Authentication Error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newLocation = await pickupLocationService.createPickupLocation({
        name: newLocationName,
        address: newLocationAddress,
        operatingHours: newLocationHours,
      }, user.uid, userProfile.displayName);

      setLocations(prev => [newLocation, ...prev]);
      toast({ title: 'Location Added!', description: `${newLocation.name} is now available as a pickup station.` });

      // Reset form
      setNewLocationName('');
      setNewLocationAddress('');
      setNewLocationHours('');
      
    } catch (error) {
      console.error('Failed to add pickup location:', error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error creating the new location.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add New Location</CardTitle>
            <CardDescription>Create a new pickup station for customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                placeholder="e.g., Westlands Hub"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-address">Address</Label>
              <Input
                id="location-address"
                placeholder="e.g., The Mall, 2nd Floor"
                value={newLocationAddress}
                onChange={(e) => setNewLocationAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-hours">Operating Hours</Label>
              <Input
                id="location-hours"
                placeholder="e.g., Mon-Fri: 9am - 6pm"
                value={newLocationHours}
                onChange={(e) => setNewLocationHours(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleAddLocation} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Add Location
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Pickup Locations</CardTitle>
            <CardDescription>A list of all active pickup stations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length > 0 ? locations.map(location => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>{location.operatingHours}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No pickup locations created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
