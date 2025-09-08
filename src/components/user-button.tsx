'use client';

import { UserButton } from "@clerk/nextjs";

export default function UserButtonWrapper() {
  return (
    <div className="flex items-center">
      <UserButton 
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: 'h-10 w-10',
            userButtonPopoverCard: 'bg-slate-800 border border-slate-700',
            userButtonPopoverActionButtonText: 'text-slate-200 hover:bg-slate-700',
            userButtonPopoverActionButton: 'hover:bg-slate-700',
            userButtonPopoverFooter: 'border-t border-slate-700',
          },
        }}
      />
    </div>
  );
}
