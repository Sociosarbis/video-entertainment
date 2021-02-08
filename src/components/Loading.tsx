import React, { useState, useCallback } from 'react';
import { CircularProgress, Backdrop, makeStyles } from '@material-ui/core';

type Props = {
  visible: boolean;
};

const useStyles = makeStyles({
  top: {
    zIndex: 9999,
  },
});

function Loading({ visible }: Props) {
  const classes = useStyles({});
  return (
    <Backdrop className={classes.top} open={visible} invisible={true}>
      <CircularProgress />
    </Backdrop>
  );
}

function useLoading() {
  const [visible, setVisible] = useState(false);
  const withLoading = useCallback(async function <T>(p: Promise<T>) {
    try {
      setVisible(true);
      return await p;
    } finally {
      setVisible(false);
    }
  }, []);
  return {
    setLoading: setVisible,
    withLoading,
    Loading() {
      return <Loading visible={visible}></Loading>;
    },
  };
}
export { useLoading };
