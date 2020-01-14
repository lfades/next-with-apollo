import { NextPage } from 'next';
import App from 'next/app';
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
    options.getDataFromTree = 'ssr';
  }

  return (Page: NextPage<any> | typeof App) => {
    function WithApollo({ apollo, apolloState, ...props }: ApolloProps) {
      const apolloClient =
        apollo ||
        initApollo<TCache>(client, { initialState: apolloState.data });

      return <Page {...props} apollo={apolloClient} />;
    }
    const getInitialProps = Page.getInitialProps;
    const ssr = options.getDataFromTree === 'ssr';

    WithApollo.displayName = `WithApollo(${getDisplayName(Page)})`;

    if (getInitialProps || ssr) {
      WithApollo.getInitialProps = async (pageCtx: ApolloContext) => {
        const ctx = 'Component' in pageCtx ? pageCtx.ctx : pageCtx;
        const { AppTree } = pageCtx;
        const headers = ctx.req ? ctx.req.headers : {};
        const apollo = initApollo<TCache>(client, { ctx, headers });
        const apolloState: WithApolloState<TCache> = {};

        let pageProps = {};

        if (getInitialProps) {
          ctx.apolloClient = apollo;
          pageProps = await getInitialProps(pageCtx as any);
        }

        if (typeof window === 'undefined') {
          if (ctx.res && (ctx.res.headersSent || ctx.res.finished)) {
            return pageProps;
          }

          if (ssr) {
            try {
              const { getDataFromTree } = await import('@apollo/react-ssr');
              const props = { ...pageProps, apolloState, apollo };
              const appTreeProps =
                'Component' in pageCtx ? props : { pageProps: props };

              await getDataFromTree(<AppTree {...appTreeProps} />);
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

            // getDataFromTree does not call componentWillUnmount
            // head side effect therefore need to be cleared manually
            Head.rewind();

            apolloState.data = apollo.cache.extract();
          }
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
      };
    }

    return WithApollo;
  };
}
