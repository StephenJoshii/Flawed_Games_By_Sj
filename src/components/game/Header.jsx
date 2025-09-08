import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A dictionary for emoji icons
const ICONS = {
  money: '💰',
  momo: '🥟',
  day: '☀️',
};

// A reusable Stat Card component
const StatCard = ({ title, value, icon }) => (
  <div className="text-center">
    <span className="text-lg md:text-xl font-semibold text-gray-800">
      {icon} {value}
    </span>
    <p className="text-xs text-gray-500">{title}</p>
  </div>
);

export const Header = ({ money, momoStock, day }) => {
  return (
    <header className="bg-white rounded-xl shadow-lg p-4 mb-6 border-4 border-red-500">
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-red-600">Kathmandu Momo Tycoon</h1>
          <p className="text-sm md:text-base text-gray-600">From a humble cart to a momo empire!</p>
        </div>
        <div className="flex items-center space-x-4 md:space-x-6 mt-4 md:mt-0">
          <StatCard title="Cash" value={`Rs. ${money}`} icon={ICONS.money} />
          <StatCard title="Momos" value={momoStock} icon={ICONS.momo} />
          <StatCard title="Day" value={day} icon={ICONS.day} />
        </div>
      </div>
    </header>
  );
};
