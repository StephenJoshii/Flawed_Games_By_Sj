import { Tile } from "./Tile";

export function GameBoard({ grid }) {
  return (
    <div className="bg-[#bbada0] rounded-md p-4 relative w-[480px] h-[480px] select-none">
      
      {/* Background Grid Cells using CSS Grid */}
      <div className="grid grid-cols-4 grid-rows-4 gap-4">
        {Array(16).fill(0).map((_, i) => (
          <div key={i} className="w-[100px] h-[100px] bg-gray-200/50 rounded-md"></div>
        ))}
      </div>

      {/* Foreground container for the animated tiles */}
      <div className="absolute inset-0">
        {grid.flatMap((row, r) =>
          row.map((value, c) =>
            value > 0 ? <Tile key={`${r}-${c}-${value}-${Math.random()}`} value={value} x={c} y={r} /> : null
          )
        )}
      </div>
    </div>
  );
}

