import fetch from 'isomorphic-unfetch';
import { ApolloClient } from 'apollo-client';
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

function createClient(options, headers, initialState) {
  if (!options) {
    throw new Error(
      '[options] param is missing and is required to get the apollo configs'
    );
  }

  const { client, link: links } = options;

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

  const apolloClient = new ApolloClient({
    link,
    ssrMode,
    ...client({ headers, link })
  });

  if (initialState) {
    apolloClient.cache.restore(initialState);
  }

  return apolloClient;
}

export default function initApollo(options, headers, initialState) {
  if (ssrMode) {
    return createClient(options, headers, initialState);
  }
  if (!apolloClient) {
    apolloClient = createClient(options, headers, initialState);
  }
  return apolloClient;
}
