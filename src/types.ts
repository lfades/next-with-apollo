import ApolloClient from 'apollo-client';
import { IncomingHttpHeaders } from 'http';
import { NextPageContext } from 'next';
import { AppContext } from 'next/app';

export interface WithApolloOptions {
  getDataFromTree?: 'always' | 'never' | 'ssr';
}

export interface WithApolloState<TCache> {
  data?: TCache;
}

export interface WithApolloProps<TCache> {
  apolloState: WithApolloState<TCache>;
  apollo: ApolloClient<TCache>;
}

export interface InitApolloOptions<TCache> {
  ctx?: NextPageContext;
  headers?: IncomingHttpHeaders;
  initialState?: TCache;
}

export type InitApolloClient<TCache> = (
  options: InitApolloOptions<TCache>
) => ApolloClient<TCache>;

export interface ApolloPageContext<C = any> extends NextPageContext {
  // Custom prop added by withApollo
  apolloClient: ApolloClient<C>;
}

export interface ApolloAppContext<C = any> extends AppContext {
  ctx: ApolloPageContext<C>;
  AppTree: any;
}

export type ApolloContext<C = any> = ApolloPageContext<C> | ApolloAppContext<C>;
