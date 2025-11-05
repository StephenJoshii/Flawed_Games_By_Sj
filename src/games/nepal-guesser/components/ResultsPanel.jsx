import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ResultsPanel = ({ results, onNextRound, guessMarker }) => {
  if (!results) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs px-4 pb-3">
          <p className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Explore the Street View</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Click on map to guess</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>See your score!</span>
          </p>
          {guessMarker && (
            <Badge className="mt-2 bg-blue-500 text-xs">
              ✓ Guess placed
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 4000) return 'text-green-600';
    if (score >= 2000) return 'text-yellow-600';
    if (score >= 1000) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDistanceRating = (distance) => {
    if (distance < 1) return '🎯 Perfect!';
    if (distance < 10) return '🌟 Excellent!';
    if (distance < 50) return '👍 Good!';
    if (distance < 100) return '👌 Not bad!';
    if (distance < 500) return '🤔 Could be better';
    return '😅 Nice try!';
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold">Round Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-3">
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-600 mb-0.5">Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(results.score)}`}>
            {results.score.toLocaleString()}
          </p>
        </div>
        
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Distance:</span>
            <span className="font-bold">{results.distance} km</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Rating:</span>
            <span>{getDistanceRating(parseFloat(results.distance))}</span>
          </div>
          
          <div className="bg-white p-2 rounded text-xs">
            <span className="font-medium text-gray-700">Location:</span>
            <p className="text-blue-600 mt-0.5 font-semibold">{results.locationName}</p>
          </div>
        </div>

        <Button
          onClick={onNextRound}
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700 h-9"
        >
          Next Round →
        </Button>
      </CardContent>
    </Card>
  );
};
