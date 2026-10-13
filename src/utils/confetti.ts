import confetti from 'canvas-confetti';

export const triggerPointsCelebration = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4F46E5', '#6366F1', '#38BDF8', '#F59E0B', '#10B981'],
  });
};

export const triggerMajorMilestone = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
