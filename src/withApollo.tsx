import { getDataFromTree } from '@apollo/react-ssr';
import { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import initApollo from './apollo';
import {
  ApolloContext,
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

  return (Page: NextPage<any>) => {
    function WithApollo({ apollo, apolloState, ...props }: ApolloProps) {
      const apolloClient =
        apollo ||
        initApollo<TCache>(client, { initialState: apolloState.data });

      return <Page {...props} apollo={apolloClient} />;
    }
    const getInitialProps = Page.getInitialProps;
    const isLambda =
      options.getDataFromTree === 'always' || options.getDataFromTree === 'ssr';

    WithApollo.displayName = `WithApollo(${getDisplayName(Page)})`;

    if (getInitialProps || isLambda) {
      WithApollo.getInitialProps = isLambda
        ? async (appCtx: ApolloContext) => {
            const ctx = 'Component' in appCtx ? appCtx.ctx : appCtx;
            const { AppTree } = appCtx;
            const headers = ctx.req ? ctx.req.headers : {};
            const apollo = initApollo<TCache>(client, { ctx, headers });
            const apolloState: WithApolloState<TCache> = {};

            let pageProps = {};

            if (getInitialProps) {
              ctx.apolloClient = apollo;
              pageProps = await getInitialProps(ctx);
            }

            if (ctx.res && (ctx.res.headersSent || ctx.res.finished)) {
              return {};
            }

            if (
              options.getDataFromTree === 'always' ||
              (options.getDataFromTree === 'ssr' &&
                typeof window === 'undefined')
            ) {
              try {
                await getDataFromTree(
                  <AppTree
                    {...pageProps}
                    apolloState={apolloState}
                    apollo={apollo}
                  />
                );
              } catch (error) {
                // Prevent Apollo Client GraphQL errors from crashing SSR.
                if (process.env.NODE_ENV !== 'production') {
                  // tslint:disable-next-line no-console This is a necessary debugging log
                  console.error(
                    'GraphQL error occurred [getDataFromTree]',
                    error
                  );
                }
              }

              if (typeof window === 'undefined') {
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
              ...pageProps,
              apolloState,
              apollo
            };
          }
        : getInitialProps;
    }

    return WithApollo;
  };
}
