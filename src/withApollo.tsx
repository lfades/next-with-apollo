import ApolloClient from 'apollo-client';
import { AppContext, default as NextApp } from 'next/app';
import Head from 'next/head';
import PropTypes from 'prop-types';
import React from 'react';
import { getDataFromTree } from 'react-apollo';
import initApollo from './apollo';
import {
  InitApolloClient,
  WithApolloOptions,
  WithApolloProps,
  WithApolloState
} from './types';

// Gets the display name of a JSX component for dev tools
function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Unknown';
}

export default function withApollo<TCache = any>(
  client: InitApolloClient<TCache>,
  options: WithApolloOptions = {}
) {
  type ApolloProps = WithApolloProps<TCache>;

  if (!options.getDataFromTree) {
    options.getDataFromTree = 'always';
  }

  return (App: typeof NextApp) => {
    return class WithApollo extends React.Component<ApolloProps> {
      public static displayName = `WithApollo(${getDisplayName(App)})`;

      public static propTypes = {
        apolloState: PropTypes.object,
        apollo: PropTypes.object
      };

      public static getInitialProps = async (appCtx: AppContext) => {
        let appProps = {};
        if (App.getInitialProps) {
          appProps = await App.getInitialProps(appCtx);
        }

        const { Component, router, ctx } = appCtx;
        const headers = ctx.req ? ctx.req.headers : {};
        const apollo = initApollo<TCache>(client, { headers });
        const apolloState: WithApolloState<TCache> = {};
        const ssrMode = !process.browser;

        if (
          options.getDataFromTree === 'always' ||
          (options.getDataFromTree === 'ssr' && ssrMode)
        ) {
          try {
            await getDataFromTree(
              <App
                {...appProps}
                Component={Component}
                router={router}
                apolloState={apolloState}
                apollo={apollo}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            if (ssrMode && process.env.NODE_ENV !== 'production') {
              // tslint:disable-next-line no-console This is a necessary debugging log
              console.error('GraphQL SSR error occurred', error);
            }
          }

          if (ssrMode) {
            // getDataFromTree does not call componentWillUnmount
            // head side effect therefore need to be cleared manually
            Head.rewind();
          }

          apolloState.data = apollo.cache.extract();
        }

        return {
          ...appProps,
          apolloState
        };
      };

      public apollo: ApolloClient<TCache>;

      constructor(props: ApolloProps) {
        super(props);

        this.apollo =
          props.apollo ||
          initApollo<TCache>(client, { initialState: props.apolloState.data });
      }

      public render() {
        return <App {...this.props} apollo={this.apollo} />;
      }
    };
  };
}
