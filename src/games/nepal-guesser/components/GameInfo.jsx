import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const GameInfo = ({ round, totalScore, onReset }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 w-64">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-base font-semibold">Game Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Round:</span>
          <span className="text-lg font-bold text-blue-600">{round}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Score:</span>
          <span className="text-lg font-bold text-green-600">{totalScore.toLocaleString()}</span>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="w-full mt-1 h-8 text-xs"
        >
          Reset Game
        </Button>
      </CardContent>
    </Card>
  );
};
