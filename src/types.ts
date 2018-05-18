import ApolloClient, { ApolloClientOptions } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ContextSetter } from 'apollo-link-context';
import { ErrorHandler } from 'apollo-link-error';
import { IncomingHttpHeaders } from 'http';
import { AppProps } from 'next/app';

declare global {
  namespace NodeJS {
    interface Process {
      browser?: boolean;
    }
  }
}

export interface ApolloLinks {
  http: ApolloLink;
  setContext?: ContextSetter;
  onError?: ErrorHandler;
  ws?(): ApolloLink;
}

export interface CreateClientOptions<TCache> {
  link?:
    | ApolloLinks
    | ((options: { headers?: IncomingHttpHeaders }) => ApolloLinks);
  client(options: {
    headers?: IncomingHttpHeaders;
    link: ApolloLink;
  }): ApolloClientOptions<TCache>;
}

export type InitApolloOptions<TCache> =
  | ApolloClient<TCache>
  | CreateClientOptions<TCache>
  | ((options: { headers?: IncomingHttpHeaders }) => ApolloClient<TCache>);

export interface WithApolloState<TCache> {
  data?: TCache;
}

export interface WithApolloProps<TCache> extends AppProps {
  apollo: ApolloClient<TCache>;
  apolloState: WithApolloState<TCache>;
}
