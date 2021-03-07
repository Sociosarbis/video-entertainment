import React, { useCallback } from 'react';
import cls from 'classnames';
import { makeStyles } from '@material-ui/core';
import { Work, Resource } from '../apis/work';

type PlayListProps = {
  onSelect: (url: string) => void;
  currentUrl: string;
  work: Work | null;
};

export const useStyle = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gridRowGap: '10px',
    gridColumnGap: '5px',
  },
  scroller: {
    height: '300px',
    overflow: 'auto',
  },
});

export default function PlayList(props: PlayListProps) {
  const classes = useStyle({});
  const { onSelect, currentUrl, work } = props;

  const handleSelect = useCallback(
    (item: Resource) => {
      window.localStorage.setItem(`PREV_CHAP$${work?.url}`, item.url);
      onSelect(item.url);
    },
    [onSelect, work],
  );

  return work ? (
    <div className={classes.scroller}>
      <div className={classes.container}>
        {work.playList.map((item, i) => (
          <input
            key={i}
            className={cls([
              'btn',
              item.url === currentUrl ? 'btn_selected' : '',
            ])}
            type="button"
            value={item.name}
            onClick={() => handleSelect(item)}
          />
        ))}
        <span />
      </div>
    </div>
  ) : null;
}
