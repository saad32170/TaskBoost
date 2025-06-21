import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  speed: number;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speed: Math.random() * 3 + 2,
      });
    }

    setPieces(newPieces);

    // Clean up after animation
    const timeout = setTimeout(() => {
      setPieces([]);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (pieces.length === 0) return;

    const interval = setInterval(() => {
      setPieces(prev => prev.map(piece => ({
        ...piece,
        y: piece.y + piece.speed,
        rotation: piece.rotation + 5,
      })).filter(piece => piece.y < window.innerHeight + 10));
    }, 16);

    return () => clearInterval(interval);
  }, [pieces.length]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full animate-pulse"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            transition: 'none',
          }}
        />
      ))}
    </div>
  );
}
