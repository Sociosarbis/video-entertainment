import { ApolloServer, gql, GraphQLOptions } from 'apollo-server-lambda';
import { resolve as resolveWorks } from './resolvers/works';
import { resolve as resolveWorkDetail } from './resolvers/workDetail';
import { resolve as resolveCalendar } from './resolvers/calendar';
import { resolve as resolveEpisodeTopic } from './resolvers/episodeTopic';
import { resolve as resolveSubjectDetail } from './resolvers/subjectDetail';
import { resolve as resolveBgmWorks } from './resolvers/searchBgmWorks';
import { parse } from './helpers/cookie';

const typeDefs = gql`
  type Resource {
    name: String
    url: String
  }

  type WorkDetail {
    infos: Work
    playList: [Resource]
    image: String
  }

  type Work {
    name: String
    cate: String
    tag: String
    utime: String
    id: Int
  }

  type BgmWork {
    id: Int
    name: String
    cate: String
    tag: String
    utime: String
  }

  type BGMSubject {
    id: Int
    name: String
    score: Float
    image: String
    summary: String
    eps: [BGMEp!]
  }

  type BGMEp {
    id: Int!
    name: String
    desc: String
    sort: Float
    comment: Int
    airdate: String
  }

  type BGMWeekDay {
    text: String
    num: Int
    items: [BGMSubject!]
  }

  type Query {
    works(keyword: String!): [Work!]
    workDetail(id: Int!): WorkDetail
    calendar: [BGMWeekDay!]
    episodeTopic(id: Int!): EpisodeTopic
    bgmWorks(keywords: String!, type: Int): [BgmWork!]
    subjectDetail(id: Int!): BGMSubject
  }

  type Author {
    name: String
    id: Int
    msg: String
    avatar: String
  }

  type Quote {
    from: String
    text: String
  }

  type Comment {
    id: Int
    floor: String
    quote: Quote
    time: String
    text: String
    author: Author
    replies: [Comment!]
  }

  type EpisodeTopic {
    comments: [Comment!]
  }
`;

type ServerPlugin = NonNullable<GraphQLOptions['plugins']>[0];

const basicLogging: ServerPlugin = {
  requestDidStart(context) {
    console.log(context.request.query);
    console.log(context.request.variables);
    return {
      willSendResponse: (context) => {
        console.log(JSON.stringify(context.response, null, 2));
      },
    };
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      async works(_, args) {
        return await resolveWorks({ keyword: args.keyword });
      },
      async bgmWorks(_, args) {
        return await resolveBgmWorks(args.keywords, args.type);
      },
      async workDetail(_, args) {
        return await resolveWorkDetail({ id: args.id });
      },
      async calendar() {
        return await resolveCalendar();
      },
      async subjectDetail(_, args) {
        return await resolveSubjectDetail({ id: args.id });
      },
      async episodeTopic(_, args, context) {
        return await resolveEpisodeTopic(args.id, context.cookie);
      },
    },
  },
  context: (info) => {
    console.log(info.event.headers);
    return {
      cookie: parse(info.event.headers.cookie),
    };
  },
  plugins: [basicLogging],
});

const handler = server.createHandler();

export { handler };
