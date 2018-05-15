import App, { Container } from 'next/app';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { WithApolloProps } from './types';
/**
 * Useful if you don't have a custom _app and don't need one, otherwise
 * always extend from Next's App
 */
export default class ApolloApp<TCache = any> extends App<
  WithApolloProps<TCache>
> {
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
