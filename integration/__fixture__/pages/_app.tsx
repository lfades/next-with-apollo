import ApolloClient, { InMemoryCache } from 'apollo-boost';
import App, { Container } from 'next/app';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import withApollo from '../../../lib';

class MyApp extends App<any> {
  public render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo(
  ({ initialState }) =>
    new ApolloClient({
      uri: 'http://mocked.com/graphql',
      cache: new InMemoryCache().restore(initialState || {})
    }) as any
)(MyApp);
