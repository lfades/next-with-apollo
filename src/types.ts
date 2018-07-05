import ApolloClient from 'apollo-client';
import { IncomingHttpHeaders } from 'http';
import { NextContext } from 'next';
import { AppComponentContext, AppComponentProps } from 'next/app';

declare global {
  namespace NodeJS {
    interface Process {
      browser?: boolean;
    }
  }
}

export interface WithApolloOptions {
  getDataFromTree?: 'always' | 'never' | 'ssr';
}

export interface WithApolloState<TCache> {
  data?: TCache;
}

export interface WithApolloProps<TCache> extends AppComponentProps {
  apollo: ApolloClient<TCache>;
  apolloState: WithApolloState<TCache>;
}

export interface InitApolloOptions<TCache> {
  headers?: IncomingHttpHeaders;
  initialState?: TCache;
}

export type InitApolloClient<TCache> = ((
  options: InitApolloOptions<TCache>
) => ApolloClient<TCache>);

export interface AppContext extends NextContext {
  // Custom prop added by withApollo
  apolloClient: ApolloClient<any>;
}

export interface ApolloContext extends AppComponentContext {
  ctx: AppContext;
}

export type AppGetInitialProps = (
  ctx: ApolloContext
) => Promise<{
  pageProps: any;
  [key: string]: any;
}>;
