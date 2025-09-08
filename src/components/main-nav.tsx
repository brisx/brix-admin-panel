import Link from 'next/link';
import { Trophy, Home, Users, AlertTriangle, Gift } from 'lucide-react';

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </div>
      </Link>
      <Link
        href="/achievements"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <Trophy className="mr-2 h-4 w-4" />
          Achievements
        </div>
      </Link>
      <Link
        href="/users"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Users
        </div>
      </Link>
      <Link
        href="/cancellations"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Cancellations
        </div>
      </Link>
      <Link
        href="/achievement-rewards"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <Gift className="mr-2 h-4 w-4" />
          Achievement Rewards
        </div>
      </Link>
    </nav>
  );
}
