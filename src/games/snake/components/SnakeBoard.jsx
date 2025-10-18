// Renders the main game area for Snake.
export function SnakeBoard({ gridSize, snake, food }) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

  return (
    <div 
      className="bg-gray-900 border-4 border-gray-700 rounded-lg shadow-lg"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        width: 'clamp(300px, 90vmin, 600px)',
        height: 'clamp(300px, 90vmin, 600px)',
      }}
    >
      {/* Render the snake segments */}
      {snake.map((segment, index) => (
        <div 
          key={index}
          className="bg-green-500 rounded-sm"
          style={{ gridRowStart: segment.y + 1, gridColumnStart: segment.x + 1 }}
        />
      ))}
      {/* Render the food */}
      <div 
        className="bg-red-500 rounded-full"
        style={{ gridRowStart: food.y + 1, gridColumnStart: food.x + 1 }}
      />
    </div>
  );
}
