import { ApolloProvider } from '@apollo/react-hooks';
import { getDataFromTree } from '@apollo/react-ssr';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
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
    }),
  {
    getDataFromTree,
    onError: (error, ctx) => {
      if (error.message === 'missing') {
        ctx.res.statusCode = 404;
        ctx.res.end('Not Found');
      } else if (error.message === 'invalid') {
        ctx.res.statusCode = 500;
        ctx.res.end('Internal Server Error');
      } else {
        throw error;
      }
    }
  }
)(App);
