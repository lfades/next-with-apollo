import ApolloClient from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { getMainDefinition } from 'apollo-utilities';
import { IncomingHttpHeaders } from 'http';
// Polyfill fetch
import 'isomorphic-unfetch';
import { InitApolloOptions } from './types';

let _apolloClient: ApolloClient<any>;

const ssrMode = !process.browser;

export default function initApollo<TCache = any>(
  options: InitApolloOptions<TCache>,
  headers?: IncomingHttpHeaders,
  initialState?: TCache
): ApolloClient<TCache> {
  if (!options) {
    throw new Error(
      '[options] param is missing and is required to get the apollo configs'
    );
  }

  if (ssrMode) {
    return getClient<TCache>(options, headers, initialState);
  }
  if (!_apolloClient) {
    _apolloClient = getClient<TCache>(options, headers, initialState);
  }

  return _apolloClient;
}

function getClient<TCache>(
  options: InitApolloOptions<TCache>,
  headers?: IncomingHttpHeaders,
  initialState?: TCache
) {
  const client =
    typeof options.client === 'function'
      ? createClient(options, headers)
      : options.client;

  if (initialState) client.cache.restore(initialState);

  return client;
}

function createClient<TCache>(
  { client, link: linksFn }: InitApolloOptions<TCache>,
  headers?: IncomingHttpHeaders
) {
  if (typeof client !== 'function') return client;

  let link: ApolloLink | undefined;

  if (linksFn) {
    const links =
      typeof linksFn === 'function' ? linksFn({ headers }) : linksFn;

    const httpLink = links.http;

    const wsLink = !ssrMode && links.ws && links.ws();

    const contextLink = links.setContext && setContext(links.setContext);

    const errorLink = links.onError && onError(links.onError);

    link = ApolloLink.from([errorLink, contextLink, httpLink].filter(
      x => !!x
    ) as ApolloLink[]);

    link = wsLink
      ? split(
          // split based on operation type
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            );
          },
          wsLink,
          link
        )
      : link;
  }

  const options = client({ headers, link });

  if (options instanceof ApolloClient) {
    return options;
  }

  if (!link) {
    throw new Error(
      '[client] should return an instance of ApolloClient if [link] is not used'
    );
  }

  return new ApolloClient<TCache>({
    link,
    ssrMode,
    ...options
  });
}
