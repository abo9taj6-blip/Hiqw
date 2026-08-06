import React, { useEffect, useRef, useState } from "react";

interface AutoHorizontalCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  intervalMs?: number;
  className?: string;
}

export function AutoHorizontalCarousel<T extends { id: string | number }>({
  items,
  renderItem,
  intervalMs = 3000,
  className = "",
}: AutoHorizontalCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const currentIndexRef = useRef(0);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!items || items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;

      currentIndexRef.current = (currentIndexRef.current + 1) % items.length;
      const targetChild = container.children[currentIndexRef.current] as HTMLElement;
      if (targetChild) {
        // Scroll only the carousel container horizontally, avoiding any page vertical scroll jumps
        const scrollLeftPosition = targetChild.offsetLeft - (container.clientWidth - targetChild.clientWidth) / 2;
        container.scrollTo({
          left: scrollLeftPosition,
          behavior: "smooth",
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items, intervalMs, isPaused]);

  const handleTouchOrScroll = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 7000);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchOrScroll}
      className={`flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1 -mx-1 ${className}`}
      dir="rtl"
    >
      {items.map((item, index) => (
        <div key={item.id} className="snap-center shrink-0">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
