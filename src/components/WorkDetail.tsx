import React from 'react';

import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core';

type Props = {
  poster: string;
  name: string;
};

const useStyles = makeStyles((theme) => ({
  base: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.text.primary,
  },
  poster: {
    width: '150px',
    height: '200px',
  },
}));

export function WorkDetail({ poster, name }: Props) {
  const classes = useStyles({});
  return (
    <ExpansionPanel
      classes={{
        root: classes.base,
      }}
      className="mb-2"
    >
      <ExpansionPanelSummary
        expandIcon={
          <Typography variant="h6" color="textPrimary">
            ↓
          </Typography>
        }
      >
        {name}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Card
          raised={false}
          classes={{ root: classes.base }}
          className="w-full"
        >
          <Grid container direction="row">
            {poster ? (
              <CardMedia
                classes={{ root: classes.poster }}
                image={poster}
              ></CardMedia>
            ) : null}
            <CardContent>
              <Typography variant="h6">{name}</Typography>
            </CardContent>
          </Grid>
        </Card>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}
