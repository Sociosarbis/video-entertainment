import React, { useCallback, useEffect, useRef } from 'react';
import cls from 'classnames';
import { makeStyles, Slider } from '@material-ui/core';
import { Work, Resource } from '../apis/work';
import useSliders from '../hooks/useSliders';

type PlayListProps = {
  onSelect: (url: string) => void;
  currentUrl: string;
  work: Work | null;
};

export const useStyle = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gridRowGap: '20px',
    gridColumnGap: '10px',
  },
  slider: {
    padding: '0 30px',
  },
});

const PAGE_SIZE = 25;

export default function PlayList(props: PlayListProps) {
  const classes = useStyle({});
  const { onSelect, currentUrl, work } = props;

  const handleSelect = useCallback(
    (item: Resource) => {
      window.localStorage.setItem(`PREV_CHAP$${work?.id}`, item.url);
      onSelect(item.url);
    },
    [onSelect, work],
  );

  const [sliders, setSliders] = useSliders(
    work ? work.playList.length : 0,
    PAGE_SIZE,
  );

  const start = sliders.reduce((acc, item) => acc + item.i, 0);
  const hasPreviousUrlOnSameWork = useRef(false);
  const previousWork = useRef<Work | null>(null);
  useEffect(() => {
    if (!hasPreviousUrlOnSameWork.current) {
      const index =
        work?.playList.findIndex((item) => item.url === currentUrl) ?? -1;
      if (~index) {
        sliders.reduceRight((acc, item, i) => {
          const v = Math.floor(acc / item.step);
          setSliders({ type: 'change', data: { i, v: v * item.step } });
          return acc % item.step;
        }, index);
        hasPreviousUrlOnSameWork.current = true;
      }
      if (work !== previousWork.current) {
        previousWork.current = work;
        hasPreviousUrlOnSameWork.current = false;
      }
    }
  }, [work, currentUrl]);

  return work ? (
    <div>
      {sliders.map((item, i) => (
        <div key={i} className={classes.slider}>
          <Slider
            marks={true}
            step={item.step}
            min={0}
            value={item.i}
            max={item.max}
            onChange={(_, v) => setSliders({ type: 'change', data: { i, v } })}
          />
        </div>
      ))}
      <div className={classes.container}>
        {work.playList.slice(start, start + PAGE_SIZE).map((item, i) => (
          <input
            key={start + i}
            className={cls([
              'btn',
              item.url === currentUrl ? 'btn_selected' : '',
            ])}
            type="button"
            value={item.name}
            onClick={() => handleSelect(item)}
          />
        ))}
      </div>
    </div>
  ) : null;
}
