import type { ComponentType } from 'react';
import { Box, Cpu, Database, FileType, KeyRound, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { BrandMark } from '@/components/common/BrandMark';
import { cn } from '@/lib/utils';

import { logout, type CurrentUser } from '../../api/auth';

type NavItem = {
  label: string;
  link: string;
  icon: ComponentType<{ className?: string }>;
  // true = only active on exactly this address, not on the pages below it
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', link: '/machine-learning', icon: LayoutDashboard, end: true },
  { label: 'Models', link: '/machine-learning/models', icon: Box },
  { label: 'Datasets', link: '/machine-learning/datasets', icon: Database },
  { label: 'Algorithms', link: '/machine-learning/algorithms', icon: Cpu },
  { label: 'File types', link: '/machine-learning/data-types', icon: FileType },
  { label: 'API keys', link: '/machine-learning/api-keys', icon: KeyRound },
];

// "Dimitrios Example" -> "DE". Drawn here, so no picture is fetched from another website.
function getInitials(name: string): string {
  const words = name.trim().split(/[\s._@-]+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word[0]);

  return letters.join('').toUpperCase() || '?';
}

type SideBarMenuProps = {
  user: CurrentUser;
  // Called when a link is used, so the menu can close on a narrow screen
  onNavigate?: () => void;
};

// Only shown to a logged in user (see AppShell)
function SideBarMenu({ user, onNavigate }: SideBarMenuProps) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/machine-learning"
        onClick={onNavigate}
        className="flex h-16 items-center gap-2.5 px-5 text-[1.0625rem] font-semibold text-white"
      >
        <BrandMark />
        UDashboard
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.link}
            to={item.link}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-9 items-center gap-3 rounded-md px-3 text-sm',
                isActive
                  ? 'bg-sidebar-accent font-medium text-white'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white',
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-1 border-t border-white/10 p-3">
        <NavLink
          to="/identity"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-2 hover:bg-sidebar-accent/60',
              isActive && 'bg-sidebar-accent',
            )
          }
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-foreground/15 text-xs font-semibold text-white"
          >
            {getInitials(user.username)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">{user.username}</span>
            <span className="block truncate text-xs text-sidebar-foreground/70">Account</span>
          </span>
        </NavLink>
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={() => void logout()}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default SideBarMenu;
