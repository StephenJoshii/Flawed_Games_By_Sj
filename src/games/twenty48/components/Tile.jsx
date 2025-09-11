// Maps tile values to specific background and text colors for a classic 2048 look.
const TILE_COLORS = {
  2: "bg-[#eee4da] text-[#776e65]",
  4: "bg-[#ede0c8] text-[#776e65]",
  8: "bg-[#f2b179] text-white",
  16: "bg-[#f59563] text-white",
  32: "bg-[#f67c5f] text-white",
  64: "bg-[#f65e3b] text-white",
  128: "bg-[#edcf72] text-white",
  256: "bg-[#edcc61] text-white",
  512: "bg-[#edc850] text-white",
  1024: "bg-[#edc53f] text-white",
  2048: "bg-[#edc22e] text-white",
  default: "bg-[#3c3a32] text-white",
};

export function Tile({ value, x, y, isNew, isMerged }) {
  const colorClasses = TILE_COLORS[value] || TILE_COLORS.default;
  const positionClasses = `absolute transition-all duration-200 ease-in-out`;
  
  // Apply animation classes based on the tile's state
  const animationClass = isNew ? 'animate-tile-spawn' : isMerged ? 'animate-tile-merge' : '';
  
  const fontSizeClass = value > 1000 ? 'text-3xl' : value > 100 ? 'text-4xl' : 'text-5xl';

  return (
    <div
      className={`${positionClasses} ${colorClasses} ${animationClass} w-[100px] h-[100px] rounded-md flex items-center justify-center font-bold`}
      style={{
        top: `${y * 116 + 16}px`, // 100px tile + 16px gap
        left: `${x * 116 + 16}px`,
      }}
    >
      <span className={fontSizeClass}>{value > 0 ? value : ""}</span>
    </div>
  );
}
