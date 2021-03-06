import { useCallback, useRef, TouchEvent } from 'react';

type onSwipe = (params?: {
  x: number;
  y: number;
  time: number;
  velocity: {
    x: number;
    y: number;
  };
}) => any;

export default function useSwipe() {
  const pos = useRef({ x: 0, y: 0, time: 0 });
  const onSwipe = useRef<onSwipe>(() => {
    //
  });
  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      pos.current.x = e.touches[0].clientX;
      pos.current.y = e.touches[0].clientY;
      pos.current.time = performance.now();
    },
    [pos],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const x = e.changedTouches[0].clientX - pos.current.x;
      const y = e.changedTouches[0].clientY - pos.current.y;
      const time = performance.now() - pos.current.time;
      onSwipe.current({
        x,
        y,
        time,
        velocity: {
          x: x / time,
          y: y / time,
        },
      });
    },
    [pos, onSwipe],
  );
  return {
    onTouchStart,
    onTouchEnd,
    onSwipe,
  };
}
