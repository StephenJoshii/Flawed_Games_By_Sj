import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ResultsPanel = ({ results, onNextRound, guessMarker }) => {
  if (!results) {
    return (
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Explore the Street View to figure out where you are in Nepal</p>
          <p>2. Click on the map to place your guess marker</p>
          <p>3. Click "Make Guess" to see how close you were!</p>
          {guessMarker && (
            <Badge className="mt-2 bg-blue-500">
              Guess placed at: {guessMarker.lat.toFixed(4)}, {guessMarker.lng.toFixed(4)}
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
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <CardHeader>
        <CardTitle className="text-lg">Round Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
            {results.score.toLocaleString()}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Distance:</span>
            <span className="font-bold">{results.distance} km</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Rating:</span>
            <span className="text-lg">{getDistanceRating(parseFloat(results.distance))}</span>
          </div>
          
          <div className="bg-white p-2 rounded text-sm">
            <span className="font-medium">Actual Location:</span>
            <p className="text-blue-600 mt-1">{results.locationName}</p>
          </div>
        </div>

        <Button
          onClick={onNextRound}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Next Round →
        </Button>
      </CardContent>
    </Card>
  );
};
