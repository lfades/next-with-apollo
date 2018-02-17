import fetch from 'isomorphic-unfetch';
import ApolloClient from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

let apolloClient;

const ssrMode = !process.browser;

// Polyfill fetch
if (!ssrMode) {
  if (!window.fetch) window.fetch = fetch;
} else if (!global.fetch) {
  global.fetch = fetch;
}

export default function initApollo(options, headers, initialState) {
  if (ssrMode) {
    return getClient(options, headers, initialState);
  }
  if (!apolloClient) {
    apolloClient = getClient(options, headers, initialState);
  }
  return apolloClient;
}

function getClient(options, headers, initialState) {
  if (!options) {
    throw new Error(
      '[options] param is missing and is required to get the apollo configs'
    );
  }

  const apolloClient =
    typeof options.client === 'function'
      ? createClient(options, headers)
      : options.client;

  if (initialState) apolloClient.cache.restore(initialState);

  return apolloClient;
}

function createClient({ client, link: links }, headers) {
  const httpLink = links.http({ headers });

  const wsLink = !ssrMode && links.ws && links.ws({ headers });

  const contextLink = links.setContext && setContext(links.setContext);

  const errorLink = links.onError && onError(links.onError);

  let link = ApolloLink.from(
    [errorLink, contextLink, httpLink].filter(x => Boolean(x))
  );

  link = wsLink
    ? split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        link
      )
    : link;

  return new ApolloClient({
    link,
    ssrMode,
    ...client({ headers, link })
  });
}
