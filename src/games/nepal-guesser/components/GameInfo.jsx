import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const GameInfo = ({ round, totalScore, onReset }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Nepal Geo-Guesser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Round:</span>
          <span className="text-lg font-bold text-blue-600">{round}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Score:</span>
          <span className="text-lg font-bold text-green-600">{totalScore.toLocaleString()}</span>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full mt-2"
        >
          Reset Game
        </Button>
      </CardContent>
    </Card>
  );
};
