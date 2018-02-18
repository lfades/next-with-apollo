import ApolloClient, { ApolloClientOptions } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ContextSetter } from 'apollo-link-context';
import { ErrorHandler } from 'apollo-link-error';
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import { ComponentType } from 'react';

declare global {
  namespace NodeJS {
    interface Process {
      browser?: boolean;
    }
  }
}

export interface InitApolloOptions<TCache> {
  getInitialProps?: boolean;
  client:
    | ApolloClient<TCache>
    | ((
        options: { headers?: IncomingHttpHeaders; link: ApolloLink }
      ) => ApolloClientOptions<TCache>);
  link?: {
    setContext?: ContextSetter;
    onError?: ErrorHandler;
    ws?(options: { headers?: IncomingHttpHeaders }): ApolloLink;
    http(options: { headers?: IncomingHttpHeaders }): ApolloLink;
  };
}

export interface WithApolloHOC<TCache> {
  (Child: ComponentType): ComponentType<WithApolloProps<TCache>>;
  getInitialProps: GetApolloProps<TCache>;
}

export interface WithApolloProps<TCache> {
  apollo?: ApolloClient<TCache>;
  apolloState?: TCache;
}

export interface NextContext {
  err: Error;
  req: IncomingMessage;
  res: ServerResponse;
  pathname: string;
  asPath: string;
  query: {
    [key: string]: boolean | boolean[] | number | number[] | string | string[];
  };
}

export type GetInitialProps = (context: NextContext) => Promise<object>;

export type GetApolloProps<TCache> = (
  Child: ComponentType<WithApolloProps<TCache>>
) => (
  context: NextContext,
  childProps: object
) => Promise<{ apolloState?: TCache }>;
