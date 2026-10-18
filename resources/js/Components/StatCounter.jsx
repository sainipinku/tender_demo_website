import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function StatCounter({ value, prefix = '', suffix = '', duration = 1.4, className = '' }) {
  const counterRef = useRef(null);

  useEffect(() => {
    if (!counterRef.current) return;
    const rawNumber = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const target = { count: 0 };

    const tween = gsap.to(target, {
      count: rawNumber,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (counterRef.current) {
          const formatted = target.count >= 1000
            ? Math.round(target.count).toLocaleString('en-IN')
            : target.count.toFixed(target.count % 1 !== 0 ? 1 : 0);
          counterRef.current.innerText = `${prefix}${formatted}${suffix}`;
        }
      },
    });

    return () => tween.kill();
  }, [value, prefix, suffix, duration]);

  return <span ref={counterRef} className={`tabular-nums font-heading font-extrabold ${className}`}>{prefix}0{suffix}</span>;
}
