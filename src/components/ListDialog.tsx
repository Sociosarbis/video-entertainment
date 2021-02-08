import React, { ReactNode, useState } from 'react';
import {
  Dialog,
  ListItem,
  List,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';

type Props = {
  title?: string;
  open: boolean;
  list: any[];
  setOpen: (open: boolean) => any;
  renderItem?: ((item: any) => ReactNode) | null;
  onItemClick?: ((item: any) => any) | null;
};

function useListDialog() {
  const [open, setOpen] = useState(false);
  return {
    setOpen,
    ListDialog({
      title,
      list = [],
      renderItem,
      onItemClick,
    }: Partial<Exclude<Props, 'setOpen' | 'open'>>) {
      return (
        <ListDialog
          open={open}
          setOpen={setOpen}
          list={list}
          title={title}
          renderItem={renderItem}
          onItemClick={onItemClick}
        ></ListDialog>
      );
    },
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.text.primary,
  },
}));

function ListDialog({
  title,
  open,
  list,
  renderItem,
  setOpen,
  onItemClick,
}: Props) {
  const classes = useStyles({});

  return (
    <Dialog
      classes={{
        paper: classes.paper,
      }}
      open={open}
      onBackdropClick={() => setOpen(false)}
      fullWidth
    >
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <List>
        {list.length ? (
          list.map((item, i) => {
            return (
              <ListItem
                key={i}
                button
                onClick={() => onItemClick && onItemClick(item)}
              >
                {renderItem ? renderItem(item) : item}
              </ListItem>
            );
          })
        ) : (
          <ListItem>空</ListItem>
        )}
      </List>
    </Dialog>
  );
}

export { useListDialog };
