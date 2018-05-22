
/**
 * Currently the types for Next do not include types for _app
 */
declare module 'next/app' {
  import { ApolloClient } from 'apollo-client';
  import { IncomingMessage, ServerResponse } from 'http';
  import { SingletonRouter } from 'next/router';
  import React from 'react';

  export interface Context {
    err?: Error;
    req: IncomingMessage;
    res: ServerResponse;
    pathname: string;
    asPath: string;
    query: {
      [key: string]:
        | boolean
        | boolean[]
        | number
        | number[]
        | string
        | string[];
    };
    // Custom prop added by withApollo
    apolloClient: ApolloClient<any>
  }

  export interface AppProps {
    Component: React.ComponentType<any>;
    router: SingletonRouter;
    [key: string]: any;
  }

  export interface AppContext {
    Component: React.ComponentType<any>;
    // Note: The router in the server is similar to the one in the client but
    // they're not equal, so this type is not a real representation
    router: SingletonRouter;
    ctx: Context;
  }

  export class Container extends React.Component {}

  export default class App<Props = {}> extends React.Component<
    Props & AppProps
  > {
    public static getInitialProps(
      ctx: AppContext
    ): Promise<{
      [key: string]: any;
    }>;
  }
}
