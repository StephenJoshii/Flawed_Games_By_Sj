import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <div className="container mx-auto py-12">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter">My Game Arcade</h1>
        <p className="text-muted-foreground mt-2 text-lg">A collection of mini-games.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* This is where you'll add more games in the future */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Kathmandu Momo Tycoon</CardTitle>
            <CardDescription>Build a momo empire from a humble street cart in this addictive tycoon game.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Link to="/play/momo-tycoon" className="w-full">
              <Button className="w-full">Play Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>2048</CardTitle>
            <CardDescription>Slide and combine numbered tiles to reach the elusive 2048 tile in this classic puzzle game.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Link to="/play/2048" className="w-full">
              <Button className="w-full">Play Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
