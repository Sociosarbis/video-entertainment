import React, { useCallback, useEffect } from 'react';
import cls from 'classnames';
import { makeStyles } from '@material-ui/core';
import { Work, Resource } from '../apis/work';

type PlayListProps = {
  onSelect: (url: string) => void;
  currentUrl: string;
  work: Work | null;
};

const useStyle = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gridRowGap: '10px',
    gridColumnGap: '5px',
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

  useEffect(() => {
    if (work) {
      const prevChapUrl =
        window.localStorage.getItem(`PREV_CHAP$${work?.url}`) || '';
      if (prevChapUrl) {
        onSelect(prevChapUrl);
      }
    }
  }, [onSelect, work]);
  return work ? (
    <div>
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
