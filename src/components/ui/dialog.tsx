'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ className, children }: DialogContentProps) => (
  <div className={cn(
    "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mx-4",
    className
  )}>
    {children}
  </div>
);

const DialogHeader = ({ className, children }: DialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
    {children}
  </div>
);

const DialogTitle = ({ className, children }: DialogTitleProps) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </h2>
);

const DialogDescription = ({ className, children }: DialogDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

const DialogClose = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
);

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
};