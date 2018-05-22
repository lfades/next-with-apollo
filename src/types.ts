import ApolloClient from 'apollo-client';
import { IncomingHttpHeaders } from 'http';
import { AppProps } from 'next/app';

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

export interface WithApolloProps<TCache> extends AppProps {
  apollo: ApolloClient<TCache>;
  apolloState: WithApolloState<TCache>;
}

export interface InitApolloOptions<TCache> {
  headers?: IncomingHttpHeaders;
  initialState?: TCache;
}

export type InitApolloClient<TCache> =
  | ApolloClient<TCache>
  | ((options: InitApolloOptions<TCache>) => ApolloClient<TCache>);
