
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PartnerApplication,
  PartnerApplicationStatus,
} from '@/lib/partners.data';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader, Check, X, Award, Bike, Warehouse } from 'lucide-react';
import { partnerService } from '@/services/partner.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const partnerTypeIcons = {
  influencer: Award,
  'delivery-partner': Bike,
  'pickup-location': Warehouse,
};

export default function PartnerRequestClient({
  initialRequests,
}: {
  initialRequests: PartnerApplication[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [isUpdating, setIsUpdating] =
    useState<Record<string, 'approve' | 'reject' | false>>(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    applicationId: string;
    action: 'approve' | 'reject';
  }>({ open: false, applicationId: '', action: 'approve' });
  const { toast } = useToast();

  const handleUpdate = async (applicationId: string, status: PartnerApplicationStatus) => {
    setIsUpdating((prev) => ({ ...prev, [applicationId]: status === 'approved' ? 'approve' : 'reject' }));
    try {
      await partnerService.updateApplicationStatus(applicationId, status);
      setRequests(
        requests.map((req) =>
          req.id === applicationId ? { ...req, status } : req
        )
      );
      toast({
        title: `Application ${status}!`,
        description: `The partnership request has been ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update the application status.',
      });
    } finally {
      setIsUpdating((prev) => ({ ...prev, [applicationId]: false }));
      setActionDialog({ open: false, applicationId: '', action: 'approve' });
    }
  };

  const openConfirmationDialog = (applicationId: string, action: 'approve' | 'reject') => {
    setActionDialog({ open: true, applicationId, action });
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            These are new applications awaiting your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Partnership Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No pending applications.
                  </TableCell>
                </TableRow>
              )}
              {pendingRequests.map((req) => {
                const Icon = partnerTypeIcons[req.partnerType] || Warehouse;
                const isApproving = isUpdating[req.id] === 'approve';
                const isRejecting = isUpdating[req.id] === 'reject';
                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-medium">{req.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {req.email}
                      </div>
                       <div className="text-sm text-muted-foreground">
                        {req.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 capitalize">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{req.partnerType.replace(/-/g, ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(req.createdAt.toDate(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                        {req.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfirmationDialog(req.id, 'reject')}
                          disabled={isApproving || isRejecting}
                        >
                          {isRejecting ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openConfirmationDialog(req.id, 'approve')}
                          disabled={isApproving || isRejecting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isApproving ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, applicationId: '', action: 'approve' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'approve'
                ? "This will approve the application and create a new user account for this partner. They will receive an email to set up their password. This action cannot be undone."
                : "This will permanently reject the application. This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUpdate(actionDialog.applicationId, actionDialog.action === 'approve' ? 'approved' : 'rejected')}
              className={actionDialog.action === 'reject' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirm {actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
