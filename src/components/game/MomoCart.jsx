import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MomoCart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Your Momo Stall</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        {/* This is a simple, clean SVG representing a food stall. */}
        <svg
          width="150"
          height="150"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          {/* Awning stripes */}
          <path d="M4 11.5l1.2 -1.2" />
          <path d="M8 11.5l1.2 -1.2" />
          <path d="M12 11.5l1.2 -1.2" />
          <path d="M16 11.5l1.2 -1.2" />
          {/* Roof */}
          <path d="M3 12.5l9 -9l9 9h-18" />
          {/* Posts */}
          <path d="M6 12.5v7.5" />
          <path d="M18 12.5v7.5" />
          {/* Counter */}
          <path d="M4 20h16" />
        </svg>
      </CardContent>
    </Card>
  );
}

