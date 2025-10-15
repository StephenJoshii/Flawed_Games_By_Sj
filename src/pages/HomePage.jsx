import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HomePage() {
  return (
    <div className="container mx-auto py-12">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter">My Game Arcade</h1>
        <p className="text-muted-foreground mt-2 text-lg">A collection of mini-games.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card for Coup */}
        <Card className="flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle>Coup</CardTitle>
            <CardDescription>A game of deception and manipulation. Bluff your way to victory in this social deduction classic.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Link to="/play/coup" className="w-full">
              <Button className="w-full">Play Now</Button>
            </Link>
          </CardContent>
        </Card>
      
        {/* Card for Momo Tycoon */}
        <Card className="flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl">
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

        {/* Card for 2048 */}
        <Card className="flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl">
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
        
        {/* Card for Bagh Chal */}
        <Card className="flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Bagh Chal</CardTitle>
                <CardDescription>The classic Nepali strategy game of tigers and goats.</CardDescription>
              </div>
              <Badge variant="destructive">Beta</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Link to="/play/bagh-chal" className="w-full">
              <Button className="w-full">Play Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

