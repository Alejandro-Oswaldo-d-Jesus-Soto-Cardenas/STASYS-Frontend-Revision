import { useEffect, useState } from 'react';

const animationDuration = 900;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function AnimatedNumber({ value, decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(() => (prefersReducedMotion() ? value : 0));
  const formatter = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  useEffect(() => {
    const target = Number(value);
    if (!Number.isFinite(target)) {
      throw new TypeError('AnimatedNumber requires a finite numeric value.');
    }

    if (prefersReducedMotion()) return undefined;

    let animationFrame;
    let startTime;

    function animate(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / animationDuration, 1);
      const easedProgress = 1 - ((1 - progress) ** 4);
      setDisplayValue(Number((target * easedProgress).toFixed(decimals)));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [decimals, value]);

  return <>{formatter.format(displayValue)}</>;
}
