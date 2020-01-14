import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import withApollo from '../lib/with-apollo';

const QUERY = gql`
  {
    hire {
      id
      name
    }
  }
`;

let e = false;

const Index = () => {
  const router = useRouter();
  useQuery(QUERY);

  if (!router || e) {
    e = true;
    return <p>null router</p>;
  }

  return <p>all good</p>;
};

export default withApollo(Index);
