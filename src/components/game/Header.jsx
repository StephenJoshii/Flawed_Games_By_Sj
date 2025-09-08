import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CookingPot, CalendarDays } from 'lucide-react';

// A single stat card component for reusability
const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="flex-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export function Header({ money, momoStock, day }) {
  return (
    <header className="mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Money" value={`Rs. ${money}`} icon={Wallet} />
        <StatCard title="Momo Stock" value={momoStock} icon={CookingPot} />
        <StatCard title="Day" value={day} icon={CalendarDays} />
      </div>
    </header>
  );
}

