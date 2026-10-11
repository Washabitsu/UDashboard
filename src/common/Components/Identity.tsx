import { useOutletContext } from 'react-router-dom';

import { DetailList } from '@/components/common/DetailList';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

import { logout, type CurrentUser } from '../../api/auth';

// The account page. It shows what Portio knows about the logged in user (GET /bff/user) and nothing else.
function Identity() {
  // AppShell hands the user to the page it shows
  const user = useOutletContext<CurrentUser>();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Account" description="Who you are signed in as." />

      <div className="space-y-6">
        <Panel title="Profile" description="These details come from your Google account and can't be changed here.">
          <DetailList
            items={[
              { label: 'Name', value: <span id="identity-username">{user.username}</span> },
              { label: 'Email', value: <span id="identity-email">{user.email}</span> },
              { label: 'Role', value: user.role },
            ]}
          />
        </Panel>

        <Panel title="Session">
          <p className="max-w-[65ch] text-sm leading-6 text-muted-foreground">
            This browser holds a session cookie that scripts can&apos;t read. The access token stays on the
            server and is added to each request there, so it never reaches the browser.
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void logout()}>
            Sign out
          </Button>
        </Panel>
      </div>
    </div>
  );
}

export default Identity;
