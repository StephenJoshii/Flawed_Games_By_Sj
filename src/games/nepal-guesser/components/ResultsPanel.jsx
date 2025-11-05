import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ResultsPanel = ({ results, onNextRound, guessMarker }) => {
  if (!results) {
    return (
      <Card className="transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg">Ready to Guess?</CardTitle>
          <CardDescription>
            {guessMarker 
              ? "Great! Now click the button above to submit your guess." 
              : "Click anywhere on the map to place your guess marker."}
          </CardDescription>
        </CardHeader>
        {guessMarker && (
          <CardContent>
            <Badge variant="secondary" className="w-full justify-center py-2">
              ✓ Guess Placed
            </Badge>
          </CardContent>
        )}
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
    <Card className="transition-all duration-300 hover:shadow-xl border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="text-lg">Round Results</CardTitle>
        <CardDescription>
          {getDistanceRating(parseFloat(results.distance))}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Your Score</p>
          <p className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
            {results.score.toLocaleString()}
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-muted-foreground">Distance:</span>
            <span className="font-bold">{results.distance} km</span>
          </div>
          
          <div className="p-3 bg-white rounded-lg">
            <p className="text-muted-foreground text-xs mb-1">Actual Location</p>
            <p className="font-semibold text-blue-600">{results.locationName}</p>
          </div>
        </div>

        <Button
          onClick={onNextRound}
          className="w-full h-11 bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105"
        >
          Next Round →
        </Button>
      </CardContent>
    </Card>
  );
};
