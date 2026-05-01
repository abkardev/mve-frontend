import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
  }, [queryClient]);

  return (
    <div className="container py-16 max-w-xl mx-auto">
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <h1 className="text-2xl font-bold">Subscription activated!</h1>
          <p className="text-muted-foreground">
            Thanks for subscribing. Your plan is now active and your vendor tools are unlocked.
          </p>
          {sessionId && <p className="text-xs text-muted-foreground">Ref: {sessionId}</p>}
          <div className="flex gap-2 justify-center pt-2">
            <Link to="/subscription"><Button variant="outline">View subscription</Button></Link>
            <Link to="/dashboard"><Button>Go to dashboard</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
