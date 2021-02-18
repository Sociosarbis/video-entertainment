import { ApolloServer, gql } from 'apollo-server-lambda';
import { resolve as resolveWorks } from './resolvers/works';
import { resolve as resolveWorkDetail } from './resolvers/workDetail';
import { resolve as resolveCalendar } from './resolvers/calendar';
import { resolve as resolveEpisodeTopic } from './resolvers/episodeTopic';
import { parse } from './helpers/cookie';

const typeDefs = gql`
  type Resource {
    name: String
    url: String
  }

  type WorkDetail {
    playList: [Resource]
    image: String
  }

  type Work {
    name: String
    cate: String
    tag: String
    utime: String
    url: String
    detail: WorkDetail
  }

  type BGMSubject {
    id: Int
    name: String
    score: Float
    image: String
    summary: String
  }

  type BGMWeekDay {
    text: String
    num: Int
    items: [BGMSubject!]
  }

  type Query {
    works(keyword: String!): [Work!]
    workDetail(url: String!): WorkDetail
    calendar: [BGMWeekDay!]
    episodeTopic(id: Int!): EpisodeTopic
  }

  type Author {
    name: String
    id: Int
    msg: String
    avatar: String
  }

  type Qoute {
    from: String
    text: String
  }

  type Comment {
    id: Int
    floor: String
    qoute: Qoute
    time: String
    text: String
    author: Author
    replies: [Comment!]
  }

  type EpisodeTopic {
    comments: [Comment!]
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      async works(_, args) {
        return await resolveWorks({ keyword: args.keyword });
      },
      async workDetail(_, args) {
        return await resolveWorkDetail({ url: args.url });
      },
      async calendar() {
        return await resolveCalendar();
      },
      async episodeTopic(_, args, context) {
        return await resolveEpisodeTopic(args.id, context.cookie);
      },
    },
    Work: {
      async detail(parent) {
        return await resolveWorkDetail({ url: parent.url });
      },
    },
  },
  context: (info) => {
    return {
      cookie: parse(info.event.headers.cookie),
    };
  },
});

const handler = server.createHandler();

export { handler };
