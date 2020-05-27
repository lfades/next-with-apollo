import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const QUERY = gql`
  {
    hire {
      id
      name
    }
  }
`;

const Index = () => (
  <Query query={QUERY}>
    {() => {
      throw new Error('unhandled');
    }}
  </Query>
);

export default Index;
