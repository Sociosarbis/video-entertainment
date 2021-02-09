import { useRef, useEffect } from 'react';

export default function useMount<T>(val: T, onMount: (ref: T) => any) {
  const ref1 = useRef<T>(val);
  const ref2 = useRef(onMount);
  useEffect(() => {
    ref2.current(ref1.current);
  }, [ref1, ref2]);
}
