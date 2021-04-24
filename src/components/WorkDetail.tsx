import React, {
  useCallback,
  useState,
  useContext,
  useEffect,
  createContext,
} from 'react';
import WorkItem from './WorkItem';
import { useListDialog } from './ListDialog';
import { GlobalContext, GlobalContextValue } from '../contexts';
import { useStyle as usePlayListStyles } from './PlayList';
import { useBaseStyles } from '../styles/base';

import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tooltip,
  Divider,
} from '@material-ui/core';
import { useApolloClient } from 'react-apollo';
import workApis, {
  FindBgmWorksResponse,
  GetBgmWorkDetailResponse,
} from '../apis/work';

import { makeStyles } from '@material-ui/core';
import FadeInImage from '../components/FadeInImage';

type Props = {
  poster: string;
  name: string;
  keywords: string;
};

const useStyles = makeStyles((theme) => ({
  base: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.text.primary,
  },
  poster: {
    width: '150px',
    height: '200px',
    flexGrow: 1,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    margin: '5px 0',
  },
  poster__wrapper: {
    display: 'flex',
    flexGrow: 1,
  },
}));

function Episode({ item }: { item: GetBgmWorkDetailResponse['eps'][0] }) {
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const workId = useContext<number>(WorkIdContext);
  return (
    <Tooltip
      open={open}
      disableHoverListener
      disableTouchListener
      interactive
      onClose={() => {
        setOpen(false);
      }}
      title={
        item.name || item.desc ? (
          <div className="leading-normal">
            <Typography variant="h5">{item.name}</Typography>
            <Divider classes={{ root: classes.divider }} />
            <div>{item.desc}</div>
            <Divider classes={{ root: classes.divider }} />
            <div>
              {item.airdate ? (
                <div className="float-left">放送日期：{item.airdate}</div>
              ) : null}
              <div className="float-right">评论：(+{item.comment})</div>
            </div>
            <Button
              component="a"
              variant="contained"
              color="primary"
              fullWidth
              href={`flutterboilerplate://episodeTopic?id=${item.id}&subject_id=${workId}`}
              target="_blank"
            >
              跳转评论区
            </Button>
          </div>
        ) : (
          ''
        )
      }
    >
      <input
        className="btn"
        type="button"
        value={item.sort}
        onClick={() => setOpen(true)}
      />
    </Tooltip>
  );
}

const WorkIdContext = createContext(0);

export function WorkDetail({ poster, name, keywords }: Props) {
  const classes = useStyles({});
  const playListClasses = usePlayListStyles({});
  const baseClasses = useBaseStyles();
  const client = useApolloClient();
  const [workId, setWorkId] = useState(0);
  const [workList, setWorkList] = useState<FindBgmWorksResponse>([]);
  const { setOpen, ListDialog } = useListDialog();
  const [eps, setEps] = useState<GetBgmWorkDetailResponse['eps']>([]);
  const { withLoading } = useContext(GlobalContext) as GlobalContextValue;
  const findBgmWork = useCallback(async () => {
    const workOptions = await withLoading(workApis.findBgmWork(keywords));
    setWorkList(workOptions);
    setOpen(true);
  }, [keywords, client, setWorkList, setOpen]);
  useEffect(() => {
    setEps([]);
  }, [name]);
  const confirmWork = useCallback(async (work: FindBgmWorksResponse[0]) => {
    setWorkId(work.id);
    const { eps } = await withLoading(workApis.getBgmWorkDetail(work.id));
    setEps(eps);
    setOpen(false);
  }, []);
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
              <FadeInImage
                classes={{
                  root: classes.poster,
                  wrapper: classes.poster__wrapper,
                }}
                src={poster}
              />
            ) : null}
            <CardContent classes={{ root: baseClasses.flexGrow1 }}>
              <Typography variant="h6">{name}</Typography>
              <Button variant="contained" color="primary" onClick={findBgmWork}>
                评论章节
              </Button>
              <ListDialog
                list={workList}
                title="搜索结果"
                renderItem={WorkItem}
                onItemClick={confirmWork}
              />
            </CardContent>
          </Grid>
          <WorkIdContext.Provider value={workId}>
            {eps.length ? (
              <div className={playListClasses.container}>
                {eps.map((item, i) => (
                  <Episode key={i} item={item} />
                ))}
                <span />
              </div>
            ) : null}
          </WorkIdContext.Provider>
        </Card>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}
