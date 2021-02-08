import React, {
  useCallback,
  useState,
  useEffect,
  forwardRef,
  MutableRefObject,
} from 'react';
import cls from 'classnames';
import { makeStyles } from '@material-ui/core';
import { Work } from '../apis/work';

type PlayListProps = {
  onSelect: (url: string) => void;
  currentUrl: string;
  work: Work | null;
};

type Resource = {
  name: string;
  url: string;
};

const useStyle = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gridRowGap: '10px',
    gridColumnGap: '5px',
  },
});

export type PlayListRef = {
  loadPlayList: (work: Work) => void;
};

export default forwardRef<PlayListRef, PlayListProps>((props, ref) => {
  const classes = useStyle({});
  const { onSelect, currentUrl, work } = props;
  const [list, setList] = useState<Resource[]>([]);
  const loadPlayList = useCallback((work: Work) => {
    const list = work.playList
      .split('\n')
      .map((line) => {
        const [name, url] = line.trim().split('$');
        return name && url
          ? {
              name,
              url: url.replace(/^http:/, 'https:'),
            }
          : null;
      })
      .filter(Boolean) as Resource[];
    setList(list);
  }, []);

  (ref as MutableRefObject<PlayListRef>).current = {
    loadPlayList,
  };

  const handleSelect = useCallback(
    (item: Resource) => {
      window.localStorage.setItem(`PREV_CHAP$${work?.url}`, item.url);
      onSelect(item.url);
    },
    [onSelect, work],
  );

  useEffect(() => {
    if (list.length && work) {
      const prevChapUrl =
        window.localStorage.getItem(`PREV_CHAP$${work?.url}`) || '';
      if (prevChapUrl) {
        onSelect(prevChapUrl);
      }
    }
  }, [list, onSelect, work]);
  return work ? (
    <div>
      <div className={classes.container}>
        {list.map((item, i) => (
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
});
