import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import withApollo from '../lib/with-apollo';

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
    {({ loading, data }: any) => {
      if (loading || !data) {
        return <p>loading</p>;
      }

      return <p>{data.hire.name}</p>;
    }}
  </Query>
);

export default withApollo(Index);
