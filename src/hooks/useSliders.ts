import { useEffect, useMemo, useReducer } from 'react';

type Slider = {
  i: number;
  step: number;
  max: number;
};

export default function useSlider(itemLength: number, pageSize: number) {
  const initialSliders = useMemo(() => {
    const sliders = [];
    const count = itemLength % 25;
    itemLength = Math.floor(itemLength / pageSize);
    if (count == 0 && itemLength !== 0) {
      itemLength--;
    }
    let base = 1;
    while (itemLength !== 0) {
      const count = itemLength % 10;
      itemLength = (itemLength - count) / 10;
      if (count === 0 && itemLength !== 0) {
        sliders.push({ base: base * pageSize, max: 10 * base * pageSize });
        itemLength -= 1;
      } else {
        sliders.push({ base: base * pageSize, max: count * base * pageSize });
      }
      base *= 10;
    }
    return sliders.map((num) => ({ i: 0, step: num.base, max: num.max }));
  }, [itemLength, pageSize]);
  const ret = useReducer(
    (state: Slider[], payload: { type: string; data: any }): Slider[] => {
      switch (payload.type) {
        case 'change':
          state[payload.data.i].i = payload.data.v;
          state = state.slice();
          break;
        case 'replace':
          state = payload.data;
          break;
        default:
      }
      return state;
    },
    initialSliders,
  );
  useEffect(() => {
    ret[1]({
      type: 'replace',
      data: initialSliders,
    });
  }, [initialSliders, ret[1]]);
  return ret;
}
