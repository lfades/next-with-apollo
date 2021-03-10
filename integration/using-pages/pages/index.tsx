import { gql } from '@apollo/client';
import { Query } from '@apollo/react-components';
import withApollo from '../utils/with-apollo';

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
