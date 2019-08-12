import { getDataFromTree } from '@apollo/react-ssr';
import ApolloClient from 'apollo-client';
import { AppProps, default as NextApp } from 'next/app';
import Head from 'next/head';
import PropTypes from 'prop-types';
import React from 'react';
import initApollo from './apollo';
import {
  ApolloContext,
  InitApolloClient,
  WithApolloOptions,
  WithApolloProps,
  WithApolloState
} from './types';

const ssrMode = typeof window === 'undefined';

// Gets the display name of a JSX component for dev tools
function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Unknown';
}

export default function withApollo<TCache = any>(
  client: InitApolloClient<TCache>,
  options: WithApolloOptions = {}
) {
  type ApolloProps = WithApolloProps<TCache> & AppProps;

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

      public static getInitialProps = async (appCtx: ApolloContext) => {
        const { Component, router, ctx } = appCtx;
        const headers = ctx.req ? ctx.req.headers : {};
        const apollo = initApollo<TCache>(client, { ctx, headers });
        const apolloState: WithApolloState<TCache> = {};
        const getInitialProps = App.getInitialProps;

        let appProps = { pageProps: {} };

        if (getInitialProps) {
          ctx.apolloClient = apollo;
          appProps = await getInitialProps(appCtx);
        }

        if (ctx.res && (ctx.res.headersSent || ctx.res.finished)) {
          return {};
        }

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
            if (process.env.NODE_ENV !== 'production') {
              // tslint:disable-next-line no-console This is a necessary debugging log
              console.error('GraphQL error occurred [getDataFromTree]', error);
            }
          }

          if (ssrMode) {
            // getDataFromTree does not call componentWillUnmount
            // head side effect therefore need to be cleared manually
            Head.rewind();
          }

          apolloState.data = apollo.cache.extract();
        }

        // To avoid calling initApollo() twice in the server we send the Apollo Client as a prop
        // to the component, otherwise the component would have to call initApollo() again but this
        // time without the context, once that happens the following code will make sure we send
        // the prop as `null` to the browser
        (apollo as any).toJSON = () => {
          return null;
        };

        return {
          ...appProps,
          apolloState,
          apollo
        };
      };

      public apollo: ApolloClient<TCache>;

      constructor(props: ApolloProps) {
        super(props);

        this.apollo =
          props.apollo ||
          initApollo<TCache>(client, {
            initialState: props.apolloState.data
          });
      }

      public render() {
        return <App {...this.props} apollo={this.apollo} />;
      }
    };
  };
}
