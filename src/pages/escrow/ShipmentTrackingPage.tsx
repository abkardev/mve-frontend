import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Truck, MapPin, CheckCircle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { orderApi } from '@/lib/escrow-api';

interface TrackingEvent {
  status: string;
  location?: string;
  timestamp: string;
  description: string;
}

const carrierTrackUrl = (carrier: string, trackingNumber: string): string | null => {
  const c = carrier.toLowerCase();
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes('aramex')) return `https://www.aramex.com/track/results?ShipmentNumber=${trackingNumber}`;
  if (c.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  return null;
};

export default function ShipmentTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: () => orderApi.getById(orderId!),
    enabled: !!orderId,
    refetchInterval: 30_000, // poll for updates
  });

  const order = data?.data;

  if (isLoading) return <div className="container py-8"><Skeleton className="h-64" /></div>;
  if (!order) return <div className="container py-8 text-center text-muted-foreground">Order not found</div>;

  const ship = order.shippingDetails;
  // Derive a simple timeline from order data — in real backend, replace with carrier webhook events
  const events: TrackingEvent[] = [
    { status: 'Order placed', timestamp: order.createdAt, description: 'Buyer placed the order' },
    ...(order.status !== 'awaiting_payment' && order.status !== 'pending'
      ? [{ status: 'Payment received', timestamp: order.createdAt, description: 'Funds held in escrow' } as TrackingEvent]
      : []),
    ...(ship?.shippedAt
      ? [{ status: 'Shipped', timestamp: ship.shippedAt, description: `Picked up by ${ship.carrier}`, location: 'Origin facility' } as TrackingEvent]
      : []),
    ...(ship?.deliveredAt
      ? [{ status: 'Delivered', timestamp: ship.deliveredAt, description: 'Package delivered to buyer' } as TrackingEvent]
      : []),
  ].reverse();

  const externalUrl = ship ? carrierTrackUrl(ship.carrier, ship.trackingNumber) : null;

  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-6">
      <Link to={`/orders/${orderId}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to order
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Shipment tracking</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
        </div>
        <Badge className="capitalize">{order.status.replace(/_/g, ' ')}</Badge>
      </div>

      {ship ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Shipment details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Carrier</p><p className="font-medium">{ship.carrier}</p></div>
              <div><p className="text-muted-foreground">Tracking number</p><p className="font-medium font-mono">{ship.trackingNumber}</p></div>
              {ship.estimatedDelivery && <div><p className="text-muted-foreground">Estimated delivery</p><p className="font-medium">{new Date(ship.estimatedDelivery).toLocaleDateString()}</p></div>}
              {ship.shippedAt && <div><p className="text-muted-foreground">Shipped on</p><p className="font-medium">{new Date(ship.shippedAt).toLocaleDateString()}</p></div>}
            </div>
            {externalUrl && (
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1">
                  Track on {ship.carrier} <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          Awaiting shipment from seller
        </CardContent></Card>
      )}

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative border-s border-border ms-3 space-y-6">
            {events.map((e, i) => (
              <li key={i} className="ms-6">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {e.status === 'Delivered' ? <CheckCircle className="h-3 w-3" /> :
                   e.status === 'Shipped' ? <Truck className="h-3 w-3" /> :
                   <Package className="h-3 w-3" />}
                </span>
                <h3 className="font-semibold text-foreground">{e.status}</h3>
                <time className="block text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</time>
                <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                {e.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {e.location}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
