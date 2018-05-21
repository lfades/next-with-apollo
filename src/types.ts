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

export interface WithApolloState<TCache> {
  data?: TCache;
}

export interface WithApolloProps<TCache> extends AppProps {
  apollo: ApolloClient<TCache>;
  apolloState: WithApolloState<TCache>;
}

export type InitApolloClient<TCache> =
  | ApolloClient<TCache>
  | ((options: { headers?: IncomingHttpHeaders }) => ApolloClient<TCache>);
