import { gql, useQuery } from '@apollo/client';
import withApollo from '../utils/with-apollo';

const QUERY = gql`
  {
    hire {
      id
      name
    }
  }
`;

const Index = () => {
  const { loading, data } = useQuery(QUERY);

  if (loading || !data) {
    return <p>loading</p>;
  }

  return <p>{data.hire.name}</p>;
};

export default withApollo(Index);
