import { ApolloServer, gql } from 'apollo-server-lambda';
import { resolve as resolveWorks } from './resolvers/works';
import { resolve as resolveWorkDetail } from './resolvers/workDetail';
import {
  resolve as resolveCalendar,
  Response as CalendarResponse,
} from './resolvers/calendar';
import { resolve as resolveSubjectDetail } from './resolvers/subjectDetail';

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
    },
    Work: {
      async detail(parent) {
        return await resolveWorkDetail({ url: parent.url });
      },
    },
  },
});

const handler = server.createHandler();

export { handler };
