import fetch from 'isomorphic-unfetch';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

let apolloClient;

// Polyfill fetch
if (process.browser) {
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

  const ssrMode = !process.browser;
  const { client, link: links } = options;

  let link = links.http({ headers });

  if (!ssrMode) {
    if (links.ws) {
      link = split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        links.ws({ headers, link }),
        link
      );
    }

    if (links.context) {
      link = setContext(links.context).concat(link);
    }
  }

  if (links.error) {
    // Handle the errors related to graphql operations
    link = onError(links.error).concat(link);
  }

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
  if (!process.browser) {
    return createClient(options, headers, initialState);
  }
  if (!apolloClient) {
    apolloClient = createClient(options, headers, initialState);
  }
  return apolloClient;
}
