import ApolloClient from 'apollo-client';
import { IncomingHttpHeaders } from 'http';
// Polyfill fetch
import 'isomorphic-unfetch';
import { InitApolloClient } from './types';

let _apolloClient: ApolloClient<any>;

const ssrMode = !process.browser;

export default function initApollo<TCache = any>(
  client: InitApolloClient<TCache>,
  headers?: IncomingHttpHeaders,
  initialState?: TCache
): ApolloClient<TCache> {
  if (!client) {
    throw new Error(
      '[client] param is missing and is required to get the ApolloClient'
    );
  }

  if (ssrMode) {
    return getClient<TCache>(client, headers, initialState);
  }
  if (!_apolloClient) {
    _apolloClient = getClient<TCache>(client, headers, initialState);
  }

  return _apolloClient;
}

function getClient<TCache>(
  client: InitApolloClient<TCache>,
  headers?: IncomingHttpHeaders,
  initialState?: TCache
) {
  if (typeof client === 'function') {
    client = client({ headers });
  }

  if (initialState) client.cache.restore(initialState);

  return client;
}
