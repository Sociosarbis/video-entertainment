import React, { useState, useCallback } from 'react';
import { Snackbar } from '@material-ui/core';

type Props = {
  msg: string;
  open: boolean;
  setOpen: (open: false) => void;
};

function useMessage() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const showMessage = useCallback(
    (msg: string) => {
      setOpen(true);
      setMsg(msg);
    },
    [setOpen, setMsg],
  );
  return {
    showMessage,
    Message() {
      return <MessageComp msg={msg} open={open} setOpen={setOpen} />;
    },
  };
}

function MessageComp({ msg, open, setOpen }: Props) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      message={msg}
      onClose={() => setOpen(false)}
    ></Snackbar>
  );
}

export { useMessage };
