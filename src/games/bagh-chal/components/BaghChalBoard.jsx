import React from 'react';

// Renders the Tiger and Goat pieces.
const Piece = ({ type, r, c, isSelected }) => {
  const size = 40;
  const cx = c * 100 + 50;
  const cy = r * 100 + 50;

  if (type === 'TIGER') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={size / 2} fill="#f59e0b" stroke={isSelected ? '#1e40af' : '#b45309'} strokeWidth="4" />
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="24" fill="white" className="select-none font-bold">T</text>
      </g>
    );
  }
  if (type === 'GOAT') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={size / 2} fill="#4b5563" stroke={isSelected ? '#1e40af' : '#1f2937'} strokeWidth="4" />
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="24" fill="white" className="select-none font-bold">G</text>
      </g>
    );
  }
  return null;
};

// Renders the Bagh Chal game board using SVG.
export function BaghChalBoard({ board, selectedPiece, possibleMoves, onCellClick }) {
  const boardSize = 500;
  const padding = 50;
  const gridSize = boardSize - padding * 2;
  const step = gridSize / 4;

  return (
    <svg width={boardSize} height={boardSize} className="bg-amber-100 rounded-lg shadow-lg">
      <g stroke="#a16207" strokeWidth="2">
        {/* Main grid lines */}
        {Array(5).fill(0).map((_, i) => (
          <React.Fragment key={i}>
            <line x1={padding + i * step} y1={padding} x2={padding + i * step} y2={boardSize - padding} />
            <line x1={padding} y1={padding + i * step} x2={boardSize - padding} y2={padding + i * step} />
          </React.Fragment>
        ))}
        {/* Diagonal lines */}
        <line x1={padding} y1={padding} x2={boardSize - padding} y2={boardSize - padding} />
        <line x1={boardSize - padding} y1={padding} x2={padding} y2={boardSize - padding} />
        <line x1={padding} y1={gridSize / 2 + padding} x2={gridSize / 2 + padding} y2={padding} />
        <line x1={gridSize / 2 + padding} y1={padding} x2={boardSize - padding} y2={gridSize / 2 + padding} />
        <line x1={boardSize - padding} y1={gridSize / 2 + padding} x2={gridSize / 2 + padding} y2={boardSize - padding} />
        <line x1={gridSize / 2 + padding} y1={boardSize - padding} x2={padding} y2={gridSize / 2 + padding} />
      </g>

      {/* Clickable hotspots and move indicators */}
      {board.map((row, r) =>
        row.map((_, c) => {
          const isPossibleMove = possibleMoves.some(move => move.r === r && move.c === c);
          return (
            <g key={`${r}-${c}`}>
              {isPossibleMove && (
                <circle cx={c * step + padding} cy={r * step + padding} r="10" fill="#3b82f6" className="opacity-50" />
              )}
              <circle
                cx={c * step + padding}
                cy={r * step + padding}
                r="25"
                fill="transparent"
                onClick={() => onCellClick(r, c)}
                className="cursor-pointer"
              />
            </g>
          )
        })
      )}
      
      {/* Game pieces */}
      {board.map((row, r) =>
        row.map((piece, c) => (
          <Piece key={`p-${r}-${c}`} type={piece} r={r} c={c} isSelected={selectedPiece?.r === r && selectedPiece?.c === c} />
        ))
      )}
    </svg>
  );
}
