import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Smile, Meh, Frown } from 'lucide-react';

// A keyframes animation for the floating text
const animationStyle = `
  @keyframes float-up {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-40px); opacity: 0; }
  }
  .animate-float-up {
    animation: float-up 1s ease-out forwards;
  }
`;

const getPatienceIcon = (patience) => {
  if (patience > 60) return <Smile className="h-5 w-5 text-green-500" />;
  if (patience > 25) return <Meh className="h-5 w-5 text-yellow-500" />;
  return <Frown className="h-5 w-5 text-red-500" />;
};

const Customer = ({ customer, onServeCustomer }) => {
  const customerRef = useRef(null);

  const handleServe = () => {
    onServeCustomer(customer.id, customerRef);
  };

  return (
    <div ref={customerRef} className="bg-secondary p-3 rounded-lg flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Customer</span>
          {getPatienceIcon(customer.patience)}
        </div>
        <Progress value={customer.patience} className="h-1.5" />
      </div>
      <Button size="sm" onClick={handleServe}>Serve</Button>
    </div>
  );
};

export function CustomerQueue({ customers, onServeCustomer, lastServedInfo }) {
  return (
    <Card>
      <style>{animationStyle}</style>
      {lastServedInfo && (
        <div
          key={lastServedInfo.id} // Re-trigger animation on new serve
          className="absolute font-bold text-lg text-green-500 animate-float-up pointer-events-none"
          style={{ left: `${lastServedInfo.x}px`, top: `${lastServedInfo.y}px` }}
        >
          +Rs. 50
        </div>
      )}
      <CardHeader>
        <CardTitle>Customer Queue</CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customers.map(customer => (
              <Customer key={customer.id} customer={customer} onServeCustomer={onServeCustomer} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No customers waiting. Enjoy the peace!</p>
        )}
      </CardContent>
    </Card>
  );
}

