import React, { useCallback, useState, useEffect } from 'react';
import cls from 'classnames';

type PlayListProps = {
  onSelect: (url: string) => void;
  currentUrl: string;
};

type Resource = {
  name: string;
  url: string;
};

export default function PlayList(props: PlayListProps) {
  const { onSelect, currentUrl } = props;
  const [text, setText] = useState('');
  const [list, setList] = useState<Resource[]>([]);
  const loadPlayList = useCallback(() => {
    const list = text
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
    window.localStorage.setItem(`PREV_LIST`, JSON.stringify(list));
  }, [text]);

  const handleSelect = useCallback(
    (item: Resource) => {
      window.localStorage.setItem(`PREV_CHAP$${list[0].url}`, item.url);
      onSelect(item.url);
    },
    [onSelect, list],
  );

  useEffect(() => {
    try {
      setList(JSON.parse(window.localStorage.getItem(`PREV_LIST`) || '[]'));
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    if (list.length) {
      const prevChapUrl =
        window.localStorage.getItem(`PREV_CHAP$${list[0].url}`) || '';
      if (prevChapUrl) {
        onSelect(prevChapUrl);
      }
    }
  }, [list, onSelect]);
  return (
    <div>
      <textarea
        className="w-full bg-black input mb-2"
        placeholder="输入播放列表"
        style={{ resize: 'none', height: '100px' }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="button"
        className="mr-1 btn mb-2"
        value="加载播放列表"
        onClick={loadPlayList}
      />
      <div>
        {list.map((item, i) => (
          <input
            key={i}
            className={cls([
              'mr-1',
              'mb-2',
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
  );
}
