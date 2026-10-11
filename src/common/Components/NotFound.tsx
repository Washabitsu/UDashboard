import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

// Shown for an address that no route matches
function NotFound() {
  return (
    <div className="py-16">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold">There is no page at this address</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The link may be old, or the item it pointed to was deleted.
      </p>
      <Button asChild className="mt-6">
        <Link to="/machine-learning">Go to the overview</Link>
      </Button>
    </div>
  );
}

export default NotFound;
