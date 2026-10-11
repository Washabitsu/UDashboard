import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import type { CurrentUser } from '@/api/auth';
import SideBarMenu from '@/common/Components/SideBarMenu';
import { BrandMark } from '@/components/common/BrandMark';
import { cn } from '@/lib/utils';

// The frame around every page of a logged in user: the sidebar on the left, the page on the right.
// On a narrow screen the sidebar is hidden behind a menu button in a bar at the top.
export function AppShell({ user }: { user: CurrentUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-58">
      <a
        href="#page"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to the page
      </a>

      <div
        data-surface="dark"
        className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 text-sidebar-foreground lg:hidden"
      >
        <Link to="/machine-learning" className="flex items-center gap-2.5 font-semibold text-white">
          <BrandMark size={24} />
          UDashboard
        </Link>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md hover:bg-sidebar-accent"
          aria-label={isMenuOpen ? 'Close the menu' : 'Open the menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Dims the page behind the open menu. A click on it closes the menu. */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-sidebar/50 lg:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      <aside
        data-surface="dark"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-58 bg-sidebar text-sidebar-foreground',
          // invisible also takes the hidden menu out of the tab order
          isMenuOpen ? 'visible' : 'invisible max-lg:-translate-x-full lg:visible',
        )}
      >
        <SideBarMenu user={user} onNavigate={() => setIsMenuOpen(false)} />
      </aside>

      <main id="page" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <Outlet context={user} />
      </main>
    </div>
  );
}
