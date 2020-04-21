import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { getDataFromTree } from '@apollo/react-ssr';
import App from 'next/app';
import withApollo from '../../../lib';

class MyApp extends App<any> {
  public render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(
  ({ initialState }) =>
    new ApolloClient({
      uri: 'http://mocked.com/graphql',
      cache: new InMemoryCache().restore(initialState || {})
    }),
  { getDataFromTree }
)(MyApp);
