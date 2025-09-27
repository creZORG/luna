
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
import { CalendarCheck, Coffee } from 'lucide-react';
import Link from 'next/link';

interface RollCallModalProps {
  isOpen: boolean;
  onClockIn: () => void;
  onDayOff: () => void;
}

export function RollCallModal({ isOpen, onClockIn, onDayOff }: RollCallModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[425px]"
      >
        <DialogHeader className="text-center items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <CalendarCheck className="w-10 h-10 text-primary" />
            </div>
          <DialogTitle className="text-2xl">Daily Roll Call</DialogTitle>
          <DialogDescription>
            Good morning! Please clock in to log your attendance for today or
            take the day off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-4">
          <Button variant="outline" size="lg" onClick={onDayOff}>
            <Coffee className="mr-2" />
            Take a Day Off
          </Button>
          <Button asChild size="lg" onClick={onClockIn}>
            <Link href="/admin/attendance/check-in">
              <CalendarCheck className="mr-2" />
              Clock In Now
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
