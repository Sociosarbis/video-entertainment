import React, { useEffect, useContext } from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { useBaseStyles } from '../styles/base';
import cls from 'classnames';
import {
  Grid,
  Card,
  CardMedia,
  CardHeader,
  CardActionArea,
  Paper,
  makeStyles,
  Typography,
  CardContent,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { GlobalContext, GlobalContextValue } from '../contexts';
import img404 from '../assets/images/404.png';

const Query = gql`
  query Calendar {
    calendar {
      num
      text
      items {
        id
        name
        score
        image
      }
    }
  }
`;

type Data = {
  text: string;
  num: number;
  items: {
    id: number;
    name: string;
    score: number;
    image: string;
  }[];
}[];

const useStyles = makeStyles({
  weekDay: {
    overflow: 'auto',
    flexWrap: 'nowrap',
    marginBottom: '20px',
  },
  image: {
    width: '150px',
    height: '150px',
    margin: '0 auto',
  },
  card: {
    width: '150px',
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'column',
  },
  cardHeaderContent: {
    flex: 1,
    flexDirection: 'column',
  },
  cardHeaderTitle: {},
});

const palettes = [
  'rgb(255, 15, 0)',
  'rgb(255, 102, 0)',
  'rgb(255, 158, 1)',
  'rgb(176, 222, 9)',
  'rgb(85, 187, 24)',
  'rgb(0, 133,20)',
  'rgb(4, 85, 166)',
];

function SubHeader({ text }: { text: string }) {
  return (
    <span className="text-white" dangerouslySetInnerHTML={{ __html: text }} />
  );
}

export default function Calendar() {
  const { data, loading } = useQuery<{ calendar: Data }>(Query);
  const baseClasses = useBaseStyles();
  const classes = useStyles();
  const { setLoading } = useContext(GlobalContext) as GlobalContextValue;
  const history = useHistory<any>();
  useEffect(() => {
    setLoading(loading);
  }, [loading]);
  return (
    <div
      className={cls(
        'bottom-navigation-page overflow-auto',
        baseClasses.container,
      )}
    >
      <Paper square classes={{ root: baseClasses.container }}>
        {data ? (
          data.calendar.map((day, i) => {
            return (
              <Grid
                container
                direction="row"
                key={i}
                classes={{ root: classes.weekDay }}
              >
                <Card
                  square
                  raised
                  key={i}
                  classes={{
                    root: baseClasses.flexNone,
                  }}
                  style={{ backgroundColor: palettes[i], color: '#fff' }}
                >
                  <CardContent>
                    <Typography variant="h5">{day.text}</Typography>
                  </CardContent>
                </Card>
                {day.items.map((item, j) => {
                  return (
                    <Card
                      square
                      key={j}
                      onClick={() => {
                        history.push(`/?search=${item.name}`);
                      }}
                      classes={{
                        root: cls(baseClasses.flexNone, classes.card),
                      }}
                      style={{ backgroundColor: palettes[i], color: '#fff' }}
                    >
                      <CardActionArea className="h-full">
                        <Grid container className="h-full" direction="column">
                          <CardHeader
                            classes={{
                              root: cls(baseClasses.flex1, baseClasses.column),
                              content: cls(
                                baseClasses.column,
                                baseClasses.flex,
                                'w-full',
                              ),
                              title: baseClasses.flex1,
                            }}
                            title={item.name}
                            titleTypographyProps={{ variant: 'inherit' }}
                            subheaderTypographyProps={{ variant: 'inherit' }}
                            subheader={
                              <SubHeader
                                text={
                                  !item.score ? '无评分' : `评分：${item.score}`
                                }
                              ></SubHeader>
                            }
                          ></CardHeader>
                          <CardMedia
                            classes={{ root: classes.image }}
                            image={item.image || img404}
                          ></CardMedia>
                        </Grid>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Grid>
            );
          })
        ) : !loading ? (
          <CardContent classes={{ root: 'text-center' }}>
            <Typography>无有效数据</Typography>
          </CardContent>
        ) : null}
      </Paper>
    </div>
  );
}
