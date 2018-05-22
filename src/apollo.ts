import ApolloClient from 'apollo-client';
// Polyfill fetch
import 'isomorphic-unfetch';
import { InitApolloClient, InitApolloOptions } from './types';

let _apolloClient: ApolloClient<any>;

const ssrMode = !process.browser;

export default function initApollo<TCache = any>(
  client: InitApolloClient<TCache>,
  options?: InitApolloOptions<TCache>
): ApolloClient<TCache> {
  if (!client) {
    throw new Error(
      '[client] param is missing and is required to get the ApolloClient'
    );
  }

  if (ssrMode) {
    return getClient<TCache>(client, options);
  }
  if (!_apolloClient) {
    _apolloClient = getClient<TCache>(client, options);
  }

  return _apolloClient;
}

function getClient<TCache>(
  client: InitApolloClient<TCache>,
  options: InitApolloOptions<TCache> = {}
) {
  if (typeof client === 'function') {
    client = client(options);
  }

  if (options.initialState) client.cache.restore(options.initialState);

  return client;
}
