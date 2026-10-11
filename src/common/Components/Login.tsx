import { useLocation } from 'react-router-dom';

import { BrandMark } from '@/components/common/BrandMark';
import { OutlierField } from '@/components/common/OutlierField';
import { Button } from '@/components/ui/button';

import { login } from '../../api/auth';

// There is no username/password form here on purpose: sign-in is with Google.
// This page only starts the login. Portio and Projectio do the rest and bring the user back.
function Login() {
  const location = useLocation();
  // The page the visitor asked for before being sent here (see RedirectToLogin in App.tsx)
  const returnUrl = (location.state as { from?: string } | null)?.from ?? '/';

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section
        data-surface="dark"
        className="flex flex-col justify-between gap-10 bg-sidebar px-6 py-8 text-sidebar-foreground sm:px-12 sm:py-12"
      >
        <div className="flex items-center gap-2.5 text-lg font-semibold text-white">
          <BrandMark />
          UDashboard
        </div>

        <div className="hidden text-sidebar-foreground sm:block">
          <OutlierField />
        </div>

        <p className="max-w-md text-2xl leading-snug font-medium text-white sm:text-[1.75rem]">
          Train a model on your own data to find the records that don&apos;t belong.
        </p>
      </section>

      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            UDashboard uses your Google account. There is no separate password to remember.
          </p>
          <Button type="button" size="lg" className="mt-6 w-full" onClick={() => login(returnUrl)}>
            Sign in with Google
          </Button>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            You go to Google to sign in and come back here afterwards.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
