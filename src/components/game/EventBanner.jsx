import { Card, CardContent } from "@/components/ui/card";
import { Zap, PowerOff, Info } from "lucide-react";

const eventConfig = {
  'lunch-rush': {
    title: "Office Lunch Rush!",
    description: "Customers are arriving much faster!",
    Icon: Zap,
    color: "text-green-500",
  },
  'load-shedding': {
    title: "Load Shedding!",
    description: "The power is out. You can't make new momos.",
    Icon: PowerOff,
    color: "text-red-500",
  },
};

export function EventBanner({ activeEvent }) {
  if (!activeEvent || !activeEvent.type) return null;

  const config = eventConfig[activeEvent.type] || {
    title: "Event",
    description: "",
    Icon: Info,
    color: "text-gray-500",
  };
  const { Icon, title, description, color } = config;
  
  const progress = (activeEvent.timeLeft / activeEvent.duration) * 100;

  return (
    <Card className="mb-4 border-2 border-primary animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Icon className={`h-8 w-8 ${color}`} />
          <div className="flex-grow">
            <h3 className={`font-bold text-lg ${color}`}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-1 bg-primary rounded-full transition-all duration-1000 linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
