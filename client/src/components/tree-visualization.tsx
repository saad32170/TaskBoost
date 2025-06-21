import { useState, useEffect } from "react";

interface TreeVisualizationProps {
  level: number;
  completedTasks: number;
}

export default function TreeVisualization({ level, completedTasks }: TreeVisualizationProps) {
  const [isGrowing, setIsGrowing] = useState(false);

  useEffect(() => {
    if (completedTasks > 0) {
      setIsGrowing(true);
      const timeout = setTimeout(() => setIsGrowing(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [completedTasks]);

  const getTreeEmoji = (level: number) => {
    if (level >= 10) return "🌳"; // Mighty Oak
    if (level >= 7) return "🌲"; // Evergreen
    if (level >= 5) return "🌿"; // Bush
    if (level >= 3) return "🌱"; // Sprout
    return "🌾"; // Seedling
  };

  const getTreeName = (level: number) => {
    if (level >= 10) return "Mighty Productivity Oak";
    if (level >= 7) return "Flourishing Pine";
    if (level >= 5) return "Growing Bush";
    if (level >= 3) return "Young Sprout";
    return "Tiny Seedling";
  };

  const getTreeSize = (level: number) => {
    return Math.min(128 + (level * 8), 256);
  };

  const treeSize = getTreeSize(level);

  return (
    <div className="relative inline-block">
      {/* Tree visualization container */}
      <div className="relative mx-auto" style={{ width: treeSize, height: treeSize }}>
        {/* Tree trunk (only for higher levels) */}
        {level >= 3 && (
          <div 
            className="absolute bottom-0 bg-amber-800 rounded-t-sm"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              width: Math.max(8, level * 2),
              height: Math.max(20, level * 4),
            }}
          />
        )}
        
        {/* Main tree */}
        <div 
          className={`absolute bottom-0 flex items-center justify-center ${isGrowing ? 'animate-bounce' : ''}`}
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: `${treeSize * 0.4}px`,
            bottom: level >= 3 ? `${Math.max(16, level * 3)}px` : '0px',
          }}
        >
          {getTreeEmoji(level)}
        </div>

        {/* Floating leaves/rewards around tree */}
        {completedTasks > 0 && (
          <>
            <div 
              className="absolute animate-bounce"
              style={{
                top: '20%',
                left: '15%',
                fontSize: '24px',
                animationDelay: '0s',
              }}
            >
              🍃
            </div>
            <div 
              className="absolute animate-bounce"
              style={{
                top: '25%',
                right: '20%',
                fontSize: '20px',
                animationDelay: '150ms',
              }}
            >
              🍃
            </div>
            <div 
              className="absolute animate-bounce"
              style={{
                top: '35%',
                left: '25%',
                fontSize: '16px',
                animationDelay: '300ms',
              }}
            >
              🍃
            </div>
          </>
        )}

        {/* Level indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-full px-3 py-1 shadow-md border">
            <span className="text-sm font-bold text-green-700">Level {level}</span>
          </div>
        </div>
      </div>

      {/* Tree info */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-green-700 mb-1">
          {getTreeName(level)}
        </h3>
        <p className="text-sm text-green-600">
          {completedTasks} tasks completed this week
        </p>
      </div>
    </div>
  );
}
