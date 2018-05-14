import App, { AppContext, AppProps, Container } from 'next/app';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { WithApolloProps } from './types';

export { App, AppContext, AppProps, Container };

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

export function WithApolloApp<TCache = any>(
  CustomApp: React.ComponentType<WithApolloProps<TCache>>
) {
  return class extends App<WithApolloProps<TCache>> {
    public render() {
      return (
        <Container>
          <ApolloProvider client={this.props.apollo}>
            <CustomApp {...this.props} />
          </ApolloProvider>
        </Container>
      );
    }
  };
}
