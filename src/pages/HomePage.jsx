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

        {/* Example of a future game card */}
        <Card className="border-dashed">
           <CardHeader>
            <CardTitle className="text-muted-foreground">Bagh Chal</CardTitle>
            <CardDescription className="text-muted-foreground">Classic Nepali strategy game. Coming soon!</CardDescription>
          </CardHeader>
           <CardContent className="flex-grow flex items-end">
            <Button disabled className="w-full">Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
