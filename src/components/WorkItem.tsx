import React from 'react';
import { ListItemText, makeStyles } from '@material-ui/core';
import { FindWorksResponse } from '../apis/work';

const useStyles = makeStyles((theme) => ({
  secondary: {
    color: theme.palette.text.secondary,
  },
}));

export default function WorkItem(item: FindWorksResponse[0]) {
  const classes = useStyles({});
  const customStyles = {
    secondary: classes.secondary,
  };
  return (
    <>
      <ListItemText
        classes={customStyles}
        primary={item.name}
        secondary={item.tag}
      ></ListItemText>
      <ListItemText
        classes={customStyles}
        className="text-right"
        primary={item.cate}
        secondary={item.utime}
      ></ListItemText>
    </>
  );
}
