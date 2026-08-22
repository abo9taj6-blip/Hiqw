import React, { useEffect, useRef, useState } from "react";

interface AutoHorizontalCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  intervalMs?: number;
  className?: string;
  speed?: number;
}

export function AutoHorizontalCarousel<T extends { id: string | number }>({
  items,
  renderItem,
  className = "",
  speed = 0.35,
}: AutoHorizontalCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Duplicate items for a seamless continuous loop if items > 3
  const shouldLoop = items && items.length > 3;
  const displayItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    if (shouldLoop) {
      return [...items, ...items];
    }
    return items;
  }, [items, shouldLoop]);

  useEffect(() => {
    if (!shouldLoop || isPaused) return;

    const container = containerRef.current;
    if (!container) return;

    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.6, 2);
      lastTime = now;

      if (container && !isPaused) {
        const halfWidth = container.scrollWidth / 2;

        if (halfWidth > 0) {
          const prevPos = container.scrollLeft;

          // Reversed scroll direction (scrolling opposite direction)
          if (container.scrollLeft > 0) {
            container.scrollLeft -= speed * delta;
            if (container.scrollLeft <= 1) {
              container.scrollLeft += halfWidth;
            }
          } else {
            container.scrollLeft += speed * delta;
            if (container.scrollLeft >= -1) {
              container.scrollLeft -= halfWidth;
            }
          }

          // Fallback if browser scroll position didn't change
          if (container.scrollLeft === prevPos) {
            container.scrollLeft += (prevPos >= 0 ? speed : -speed) * delta;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [shouldLoop, isPaused, speed]);

  const handleTouchOrScroll = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchOrScroll}
      className={`flex items-stretch gap-3 overflow-x-auto no-scrollbar py-1 px-1 -mx-1 select-none ${className}`}
      dir="rtl"
    >
      {displayItems.map((item, index) => (
        <div key={`${item.id}-${index}`} className="shrink-0">
          {renderItem(item, index % items.length)}
        </div>
      ))}
    </div>
  );
}


