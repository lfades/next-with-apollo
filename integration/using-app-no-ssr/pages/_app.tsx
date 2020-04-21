import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import withApollo from '../../../lib';

const App = ({ Component, pageProps, apollo }) => (
  <ApolloProvider client={apollo}>
    <Component {...pageProps} />
  </ApolloProvider>
);

export default withApollo(
  ({ initialState }) =>
    new ApolloClient({
      uri: 'http://mocked.com/graphql',
      cache: new InMemoryCache().restore(initialState || {})
    })
)(App);
