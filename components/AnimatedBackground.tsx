
import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set the color based on theme
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? 'rgba(36, 36, 36, 0.1)' : 'rgba(36, 36, 36, 0.05)';

      // Draw morphing "zero zero" shapes
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // First zero
      ctx.beginPath();
      const radius1 = 100 + Math.sin(time) * 20;
      ctx.arc(centerX - 60, centerY, radius1, 0, Math.PI * 2);
      ctx.arc(centerX - 60, centerY, radius1 - 30, 0, Math.PI * 2, true);
      ctx.fill();

      // Second zero
      ctx.beginPath();
      const radius2 = 100 + Math.cos(time * 1.2) * 20;
      ctx.arc(centerX + 60, centerY, radius2, 0, Math.PI * 2);
      ctx.arc(centerX + 60, centerY, radius2 - 30, 0, Math.PI * 2, true);
      ctx.fill();

      // Additional morphing elements
      ctx.beginPath();
      ctx.arc(centerX - 120, centerY - 80, 40 + Math.sin(time * 2) * 10, 0, Math.PI * 2);
      ctx.arc(centerX - 120, centerY - 80, 20, 0, Math.PI * 2, true);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX + 120, centerY + 80, 40 + Math.cos(time * 2) * 10, 0, Math.PI * 2);
      ctx.arc(centerX + 120, centerY + 80, 20, 0, Math.PI * 2, true);
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
