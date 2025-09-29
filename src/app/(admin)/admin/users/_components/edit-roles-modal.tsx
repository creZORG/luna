
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserProfile, userService } from '@/services/user.service';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface EditRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  allRoles: string[];
  onRolesUpdated: (uid: string, newRoles: UserProfile['roles']) => void;
}

export function EditRolesModal({ isOpen, onClose, user, allRoles, onRolesUpdated }: EditRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user: adminUser, userProfile: adminUserProfile } = useAuth();

  const handleCheckboxChange = (role: string) => {
    setSelectedRoles(prev => 
        prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (!adminUser || !adminUserProfile) {
        toast({ variant: 'destructive', title: 'Authentication Error'});
        return;
    }
    setIsSubmitting(true);
    try {
        await userService.updateUserRoles(user.uid, selectedRoles as UserProfile['roles'], adminUser.uid, adminUserProfile.displayName);
        onRolesUpdated(user.uid, selectedRoles as UserProfile['roles']);
        toast({
            title: 'Roles Updated',
            description: `Successfully updated roles for ${user.displayName}.`
        });
        onClose();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update user roles. Please try again.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Roles for {user.displayName}</DialogTitle>
          <DialogDescription>
            Assign or remove roles to manage user permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {allRoles.map(role => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={role}
                checked={selectedRoles.includes(role)}
                onCheckedChange={() => handleCheckboxChange(role)}
              />
              <label
                htmlFor={role}
                className="text-sm font-medium leading-none capitalize peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {role.replace(/-/g, ' ')}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
