"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from 'lucide-react';

interface UsageLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageLimitPopup({ isOpen, onClose }: UsageLimitPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Important Update Regarding Service Usage
          </DialogTitle>
          <DialogDescription className="pt-2 text-left">
            Thank you for being a valued member of the LearnBridgEdu community! To ensure a sustainable and high-quality experience for all users on our free platform, we've introduced usage limits.
            <br /><br />
            Due to the increasing popularity and operational costs associated with providing this service free of charge, these limits help us maintain performance and availability for everyone. We appreciate your understanding and cooperation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="bg-brand-orange hover:bg-brand-orange/90">Okay, I understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}