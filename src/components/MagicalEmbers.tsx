import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const MagicalEmbers: React.FC = () => {
  // Generate stable magical particles
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3.5 + 1.5,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none animate-ember-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.id % 3 === 0 ? '#FFE89E' : p.id % 3 === 1 ? '#F59E0B' : '#EC4899',
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${
              p.id % 3 === 0 ? 'rgba(255, 232, 158, 0.8)' : p.id % 3 === 1 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(236, 72, 153, 0.6)'
            }`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
