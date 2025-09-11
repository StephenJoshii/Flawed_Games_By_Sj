import { Tile } from "./Tile";

export function GameBoard({ grid }) {
  // Flatten the grid to make it easier to render tiles with absolute positioning.
  const tiles = grid.flatMap((row, r) =>
    row.map((value, c) => ({ value, x: c, y: r, id: `${r}-${c}-${value}-${Math.random()}` }))
  ).filter(tile => tile.value > 0);

  return (
    <div className="bg-[#bbada0] rounded-md p-4 relative w-[480px] h-[480px] select-none">
      {/* Background Grid Cells */}
      {Array(16).fill(0).map((_, i) => (
        <div key={i} className="w-[100px] h-[100px] bg-gray-200/50 rounded-md float-left m-2"></div>
      ))}

      {/* Animated Game Tiles */}
      {tiles.map(tile => (
        <Tile key={tile.id} value={tile.value} x={tile.x} y={tile.y} />
      ))}
    </div>
  );
}
