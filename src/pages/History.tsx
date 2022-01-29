import React, { useContext, useState } from 'react';
import cls from 'classnames';
import { useHistory } from 'react-router-dom';
import {
  Paper,
  List,
  ListItem,
  Typography,
  Grid,
  Card,
  makeStyles,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  CardContent,
} from '@material-ui/core';
import { useBaseStyles } from '../styles/base';
import workApis, { GetHistoryFromDBResult, Work } from '../apis/work';
import { PlayerContext, Player } from '../hooks/usePlayer';
import useMount from '../hooks/useMount';
import FadeInImage from '../components/FadeInImage';

const useStyles = makeStyles(() => ({
  workImage: {
    width: '75px',
    height: '100px',
  },
}));

export default function History() {
  const baseClasses = useBaseStyles({});
  const player = useContext(PlayerContext) as Player;
  const classes = useStyles({});
  const [items, setItems] = useState<
    (Work & { list: GetHistoryFromDBResult[] })[]
  >([]);
  const history = useHistory<any>();
  useMount(
    {
      setItems,
    },
    async ({ setItems }) => {
      const workList = await workApis.listWorksFromDB(0, 10);
      const items = await Promise.all(
        workList.map((work) => workApis.getHistoryFromDB(0, 10, work.id)),
      );
      setItems(
        workList.map((item, i) => ({
          ...item,
          list: items[i],
        })),
      );
    },
  );
  return (
    <div className="bottom-navigation-page">
      <Paper square classes={{ root: cls(baseClasses.container, 'h-full') }}>
        <Grid container direction="column" wrap="nowrap" className="h-full">
          <Typography variant="h6" classes={{ root: baseClasses.row }}>
            播放历史
          </Typography>
          <List
            className="h-full overflow-auto"
            classes={{ root: baseClasses.primary }}
          >
            {items.map((item, i) => {
              return (
                <ListItem divider key={i}>
                  <ExpansionPanel
                    classes={{
                      root: cls(baseClasses.primary, 'w-full'),
                    }}
                  >
                    <ExpansionPanelSummary
                      expandIcon={
                        <Typography variant="h6" color="textPrimary">
                          ↓
                        </Typography>
                      }
                    >
                      <Card
                        className="mr-2"
                        classes={{
                          root: cls(
                            'w-full',
                            'd-flex',
                            baseClasses.primary,
                            'align-center',
                          ),
                        }}
                      >
                        <FadeInImage
                          classes={{ root: classes.workImage }}
                          src={item.image}
                        />
                        <CardContent>{item.name}</CardContent>
                      </Card>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <List classes={{ root: 'w-full' }}>
                        {item.list.map((item, i) => (
                          <ListItem
                            button
                            divider
                            key={i}
                            classes={{ root: baseClasses.container }}
                            onClick={async () => {
                              await player.selectPlayList(item.work);
                              player.controller.current?.handlePlay(item.url);
                              history.replace('/');
                            }}
                          >
                            {item.chap}
                          </ListItem>
                        ))}
                      </List>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </ListItem>
              );
            })}
          </List>
        </Grid>
      </Paper>
    </div>
  );
}
