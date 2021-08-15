import { DataSources } from 'apollo-server-core/dist/graphqlOptions';
import { DogsAPISource } from './extra/data-source';

export interface GraphQLContext {
  dataSources: {
    dog: DogsAPISource;
  };
}
