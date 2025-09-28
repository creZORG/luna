
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
import { UserProfile } from '@/services/user.service';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createEmailTemplate } from '@/lib/email-template';

interface EmailUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export function EmailUserModal({ isOpen, onClose, user }: EmailUserModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!subject || !body) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please provide a subject and body for the email.'
        });
        return;
    }
    
    setIsSubmitting(true);
    try {
       const emailHtml = createEmailTemplate(subject, `<p>${body.replace(/\n/g, '<br>')}</p>`);
       await sendEmail({
            from: { address: 'ceo@luna.co.ke', name: 'Luna Essentials CEO' },
            to: { address: user.email, name: user.displayName },
            subject: subject,
            htmlbody: emailHtml
       });
        toast({
            title: 'Email Sent!',
            description: `Email has been sent to ${user.displayName}.`
        });
        onClose();
        setSubject('');
        setBody('');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Send Failed',
            description: 'Could not send the email. Please try again.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email {user.displayName}</DialogTitle>
          <DialogDescription>
            Compose and send an email directly to {user.email}. The email will be sent from ceo@luna.co.ke.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className='space-y-2'>
            <Label htmlFor='subject'>Subject</Label>
            <Input 
                id='subject'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='Regarding your performance review'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='body'>Body</Label>
            <Textarea 
                id='body'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Dear ${user.displayName},`}
                rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
