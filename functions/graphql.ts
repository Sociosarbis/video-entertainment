import { ApolloServer, gql } from 'apollo-server-lambda';
import { resolve as resolveWorks } from './resolvers/works';
import { resolve as resolveWorkDetail } from './resolvers/workDetail';

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

  type Query {
    works(keyword: String!): [Work!]
    workDetail(url: String!): WorkDetail
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
