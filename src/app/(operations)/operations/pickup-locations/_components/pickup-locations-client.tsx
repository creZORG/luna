
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader, User, Link as LinkIcon, Pencil, UserPlus } from 'lucide-react';
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
import { UserProfile } from '@/services/user.service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PickupLocationsClientProps {
  initialLocations: PickupLocation[];
  partners: UserProfile[];
}

export default function PickupLocationsClient({ initialLocations, partners }: PickupLocationsClientProps) {
  const [locations, setLocations] = useState(initialLocations);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [newLocationHours, setNewLocationHours] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [locationToAssign, setLocationToAssign] = useState<PickupLocation | null>(null);
  const [partnerToAssignId, setPartnerToAssignId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const assignedPartnerIds = new Set(locations.map(loc => loc.partnerId).filter(Boolean));
  const availablePartnersForNew = partners.filter(p => !assignedPartnerIds.has(p.uid));
  const availablePartnersForAssign = partners.filter(p => !assignedPartnerIds.has(p.uid));

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
    let partnerName: string | undefined = undefined;
    if (selectedPartnerId) {
        partnerName = partners.find(p => p.uid === selectedPartnerId)?.displayName;
    }

    try {
      const newLocation = await pickupLocationService.createPickupLocation({
        name: newLocationName,
        address: newLocationAddress,
        operatingHours: newLocationHours,
        partnerId: selectedPartnerId || undefined,
        partnerName: partnerName
      }, user.uid, userProfile.displayName);

      setLocations(prev => [newLocation, ...prev]);
      toast({ title: 'Location Added!', description: `${newLocation.name} is now available as a pickup station.` });

      // Reset form
      setNewLocationName('');
      setNewLocationAddress('');
      setNewLocationHours('');
      setSelectedPartnerId('');
      
    } catch (error) {
      console.error('Failed to add pickup location:', error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error creating the new location.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignDialog = (location: PickupLocation) => {
    setLocationToAssign(location);
    setPartnerToAssignId('');
    setAssignDialogOpen(true);
  };
  
  const handleAssignPartner = async () => {
      if (!locationToAssign || !partnerToAssignId) return;
      
      setIsAssigning(true);
      try {
          const partner = partners.find(p => p.uid === partnerToAssignId);
          if (!partner) throw new Error("Partner not found");

          await pickupLocationService.assignPartnerToLocation(locationToAssign.id, partner.uid, partner.displayName);
          
          setLocations(prev => prev.map(loc => 
              loc.id === locationToAssign.id ? { ...loc, partnerId: partner.uid, partnerName: partner.displayName } : loc
          ));

          toast({ title: "Partner Assigned", description: `${partner.displayName} has been assigned to ${locationToAssign.name}.` });
          setAssignDialogOpen(false);
          setLocationToAssign(null);

      } catch (error) {
          toast({ variant: 'destructive', title: 'Assignment Failed', description: 'Could not assign partner to the location.' });
      } finally {
          setIsAssigning(false);
      }
  }


  return (
    <>
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
               <div className="space-y-2">
                <Label>Assign Partner (Optional)</Label>
                 <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a partner..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availablePartnersForNew.map(p => <SelectItem key={p.uid} value={p.uid}>{p.displayName}</SelectItem>)}
                    </SelectContent>
                 </Select>
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
              <CardDescription>A list of all active pickup stations and their assigned partners.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Assigned Partner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.length > 0 ? locations.map(location => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.address}</TableCell>
                      <TableCell>
                        {location.partnerName ? (
                          <div className='flex items-center gap-2'>
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{location.partnerName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                       <TableCell className="text-right">
                          {!location.partnerId &&
                            <Button variant="outline" size="sm" onClick={() => openAssignDialog(location)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign
                            </Button>
                          }
                       </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
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

       <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Partner to {locationToAssign?.name}</DialogTitle>
                    <DialogDescription>Select an available pickup partner to manage this location.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor='partner-assign'>Available Partners</Label>
                    <Select value={partnerToAssignId} onValueChange={setPartnerToAssignId}>
                        <SelectTrigger id='partner-assign'>
                            <SelectValue placeholder="Select a partner..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availablePartnersForAssign.map(p => <SelectItem key={p.uid} value={p.uid}>{p.displayName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     {availablePartnersForAssign.length === 0 && <p className="text-xs text-muted-foreground mt-2">No unassigned partners available.</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignPartner} disabled={isAssigning || !partnerToAssignId}>
                        {isAssigning && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
