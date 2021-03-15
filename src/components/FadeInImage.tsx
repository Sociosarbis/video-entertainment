import React, { useState } from 'react';
import { CardMedia, makeStyles } from '@material-ui/core';
import { merge } from '../utils/classes';
import cls from 'classnames';

type Props = {
  src: string;
  classes: Record<string, string>;
};

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#efefef',
  },
  img: {
    opacity: 0,
    transition: 'opacity 250ms ease-in',
  },
  img_loaded: {
    opacity: 1,
  },
}));

export default function FadeInImage({ src, classes, ...rest }: Props) {
  const [loaded, setLoaded] = useState(false);
  const styles = useStyles();
  const { wrapper, ...restClasses } = classes;
  delete classes.wrapper;
  return (
    <div className={cls(styles.root, wrapper)}>
      <CardMedia
        {...rest}
        classes={merge(
          {
            root: cls(styles.img, loaded ? styles.img_loaded : ''),
          },
          restClasses,
        )}
        component="img"
        src={src}
        onLoadStart={() => setLoaded(false)}
        onLoad={() => setLoaded(true)}
      ></CardMedia>
    </div>
  );
}
