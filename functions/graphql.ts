import { ApolloServer, gql, GraphQLExtension } from 'apollo-server-lambda';
import { print } from 'graphql';
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

type ExtensionProto = Required<typeof GraphQLExtension.prototype>;
class BasicLogging {
  requestDidStart({
    queryString,
    parsedQuery,
    variables,
  }: Required<Parameters<ExtensionProto['requestDidStart']>[0]>) {
    const query = queryString || print(parsedQuery);
    console.log(query);
    console.log(variables);
  }

  willSendResponse({
    graphqlResponse,
  }: Parameters<ExtensionProto['willSendResponse']>[0]) {
    console.log(JSON.stringify(graphqlResponse, null, 2));
  }
}

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
        return await resolveWorkDetail({ url: args.url });
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
    Work: {
      async detail(parent) {
        return await resolveWorkDetail({ url: parent.url });
      },
    },
  },
  context: (info) => {
    console.log(info.event.headers);
    return {
      cookie: parse(info.event.headers.cookie),
    };
  },
  extensions: [() => new BasicLogging()],
});

const handler = server.createHandler();

export { handler };
