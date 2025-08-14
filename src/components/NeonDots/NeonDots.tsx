import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number; opacity: number }[];
  life: number;
  maxLife: number;
  lastTurnTime: number;
  turnCooldown: number;
  isTurning: boolean;
  turnDuration: number;
}

interface NeonDotsProps {
  className?: string;
}

const NeonDots: React.FC<NeonDotsProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const particleIdRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Configuration
  const config = {
    maxParticles: 12, // Limited particles for better performance and focus
    spawnRate: 1000, // 1000ms spawn rate
    trailLength: 360, // 100% longer trails (180 * 2 = 360)
    baseSpeed: 0.45, // 40% slower (0.75 * 0.6 = 0.45)
    randomSpeed: 0.3, // 40% slower (0.5 * 0.6 = 0.3)
    horizontalDrift: 0.09, // Reduced proportionally
    noiseStrength: 0.005, // Reduced for slower movement
    turnChance: 1.0, // 100% chance per frame to turn (guaranteed turns)
    minTurnAmount: 50, // Minimum pixels to turn
    maxTurnAmount: 100, // Maximum pixels to turn (X-axis only)
  };

  // Update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create a new particle with edge-weighted spawning
  const createParticle = (): Particle => {
    const id = particleIdRef.current++;

    // Create edge-weighted X position
    // Higher probability at edges (0-20% and 80-100% of width)
    let x: number;
    const rand = Math.random();

    if (rand < 0.4) {
      // 40% chance: spawn in left edge (0-20% of width)
      x = Math.random() * (dimensions.width * 0.2);
    } else if (rand < 0.8) {
      // 40% chance: spawn in right edge (80-100% of width)
      x = dimensions.width * 0.8 + Math.random() * (dimensions.width * 0.2);
    } else {
      // 20% chance: spawn in center area
      x = dimensions.width * 0.2 + Math.random() * (dimensions.width * 0.6);
    }

    return {
      id,
      x,
      y: dimensions.height + 10, // Start slightly below screen
      vx: (Math.random() - 0.5) * config.horizontalDrift,
      vy: -(config.baseSpeed + Math.random() * config.randomSpeed),
      trail: [],
      life: 0,
      maxLife: (dimensions.height / Math.abs(config.baseSpeed)) * 3 + 300, // Even longer life for very long trails
      lastTurnTime: 0,
      turnCooldown: 1000, // 1 second cooldown
      isTurning: false,
      turnDuration: 0,
    };
  };

  // Update particle position and trail
  const updateParticle = (particle: Particle, deltaTime: number): Particle => {
    // Add current position to trail
    particle.trail.unshift({
      x: particle.x,
      y: particle.y,
      opacity: 1,
    });

    // Limit trail length
    if (particle.trail.length > config.trailLength) {
      particle.trail.pop();
    }

    // Update trail opacity with smoother fade for longer trails
    particle.trail.forEach((point, index) => {
      point.opacity = Math.pow(1 - (index / config.trailLength), 1.5); // Smoother fade curve
    });

    // Update turn state
    if (particle.isTurning) {
      particle.turnDuration -= deltaTime;
      if (particle.turnDuration <= 0) {
        particle.isTurning = false;
      }
    }

    // Random turning behavior (X-axis only) - ABRUPT turns
    if (!particle.isTurning && particle.life - particle.lastTurnTime > particle.turnCooldown) {
      if (Math.random() < config.turnChance) {
        // Abrupt turn: left or right, random amount between min and max
        // Only affects horizontal (X-axis) movement
        const turnDirection = Math.random() < 0.5 ? -1 : 1;
        const turnAmount = config.minTurnAmount + Math.random() * (config.maxTurnAmount - config.minTurnAmount);

        // ABRUPT turn: Set velocity directly instead of adding to it
        particle.vx = (turnDirection * turnAmount) / 80; // Direct velocity change for abrupt turn

        // Start turning state - PAUSE Y-axis movement
        particle.isTurning = true;
        particle.turnDuration = 300 + Math.random() * 200; // Turn lasts 300-500ms

        // Reset turn timing
        particle.lastTurnTime = particle.life;
        particle.turnCooldown = 1000; // 1 second cooldown
      }
    }

    // Add some noise to horizontal movement (only when not turning abruptly)
    if (!particle.isTurning && particle.life - particle.lastTurnTime > 100) {
      particle.vx += (Math.random() - 0.5) * config.noiseStrength;
      particle.vx *= 0.95; // Lighter damping for slower particles
    }

    // Y-axis movement: STOP when turning, otherwise move up
    if (particle.isTurning) {
      // PAUSE upward movement during turns
      particle.vy = 0;
    } else {
      // Normal upward movement with slight random variation
      particle.vy += (Math.random() - 0.5) * 0.01;
      particle.vy = Math.min(particle.vy, -0.5); // Always moving up when not turning
    }

    // Update position
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;

    // Keep within horizontal bounds with wrapping
    if (particle.x < -10) particle.x = dimensions.width + 10;
    if (particle.x > dimensions.width + 10) particle.x = -10;

    particle.life += deltaTime;

    return particle;
  };

  // Draw particle and its trail
  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    // Draw trail with optimized rendering for very long trails
    // Skip some trail points for performance with very long trails
    const skipFactor = Math.max(1, Math.floor(config.trailLength / 60)); // Skip points for trails longer than 60

    for (let i = skipFactor; i < particle.trail.length; i += skipFactor) {
      const point = particle.trail[i];
      const progress = i / config.trailLength;
      const radius = Math.max(0.3, 2.8 * (1 - progress)); // Slightly larger trail points
      const opacity = point.opacity * 0.8; // Use the pre-calculated opacity

      if (opacity > 0.03) { // Only draw visible trail points
        // Neon glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 4 * opacity;
        ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw main particle
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00ffff';

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Additional outer glow
    ctx.shadowBlur = 25;
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 6, 0, Math.PI * 2);
    ctx.fill();
  };

  // Main animation loop
  const animate = (currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Spawn new particles
    if (currentTime - lastSpawnRef.current > config.spawnRate &&
      particlesRef.current.length < config.maxParticles) {
      particlesRef.current.push(createParticle());
      lastSpawnRef.current = currentTime;
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current
      .map(particle => updateParticle(particle, 1))
      .filter(particle => particle.y > -50 && particle.life < particle.maxLife);

    // Draw all particles
    particlesRef.current.forEach(particle => {
      drawParticle(ctx, particle);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    />
  );
};

export default NeonDots;