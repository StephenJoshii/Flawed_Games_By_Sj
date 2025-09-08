import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Customer = ({ customer, onServe, maxPatience }) => {
  const patiencePercentage = (customer.patience / maxPatience) * 100;

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border flex flex-col items-center space-y-2">
      <span className="text-4xl">🙂</span>
      <Progress value={patiencePercentage} className="h-2 w-full" />
      <Button onClick={() => onServe(customer.id)} size="sm" className="w-full">
        Serve
      </Button>
    </div>
  );
};


export const CustomerQueue = ({ customers, onServeCustomer, maxPatience }) => {
  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 text-center">Waiting Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[150px]">
          {customers.length > 0 ? (
            customers.map(customer => (
              <Customer 
                key={customer.id} 
                customer={customer} 
                onServe={onServeCustomer}
                maxPatience={maxPatience}
              />
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center text-gray-500">
              <p>No customers yet...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
