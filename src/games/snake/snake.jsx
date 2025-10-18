import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export function Snake() {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen">
       <div className="absolute top-4 left-4">
        <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      <h1 className="text-4xl font-bold mb-4">Snake</h1>
      <p className="text-muted-foreground">Game coming soon...</p>
    </div>
  );
}
