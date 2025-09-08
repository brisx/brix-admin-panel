'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, BarChart2, CreditCard, IndianRupee, Wallet, XCircle, Trophy } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Achievement Rewards', href: '/admin/achievement-rewards', icon: Trophy },
  { name: 'Withdrawal', href: '/admin/withdrawal', icon: CreditCard },
  { name: 'Liquidity Cancellations', href: '/admin/liquidity-cancellations', icon: XCircle },
  { name: 'INR Payments', href: '/admin/inr-payments', icon: IndianRupee },
  { name: 'Payment Settings', href: '/admin/payment-settings', icon: Wallet },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];
  


export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-800/50 border-r border-slate-700">
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
