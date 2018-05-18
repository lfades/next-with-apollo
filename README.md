# next-with-apollo

Apollo HOC for Next.js, this docs are for Next > 6, for Next < 5  go [here](./README_V1.MD) and use the version 1.0

## How to use

Install the package with npm

```sh
npm install next-with-apollo
```

or with yarn

```sh
yarn add next-with-apollo
```

Create the HOC using a basic setup and [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost)

```js
// lib/withApollo.js
import withApollo from 'next-with-apollo'
import ApolloClient from 'apollo-boost'
import { GRAPHQL_URL } from '../configs'

export default withApollo(
  new ApolloClient({ uri: GRAPHQL_URL })
)
```

`withApollo` can also accept a function that receives `{ headers }` and returns an `ApolloClient`, keep in mind `headers` are SSR only

```js
export default withApollo(({ headers }) => (
  new ApolloClient({ uri: GRAPHQL_URL })
))
```

Wrap Next's `App` in `pages/_app.js`

```js
import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApollo from '../lib/withApollo'

class MyApp extends App {
  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp)
```

Now every page in `pages/` can use anything from `react-apollo`!

> Note: [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) is used in this example because is the more fastest way to create an `ApolloClient`, but is not required

### Letting the package create the ApolloClient

This package includes some configs to create an `ApolloClient` in a similar way `apollo-boost` does but including subscriptions, here is a basic setup:

```js
import withApollo from 'next-with-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { GRAPHQL_URL } from '../configs'

export default withApollo({
  link: {
    http: new HttpLink({
      uri: GRAPHQL_URL
    })
  },
  client: () => ({
    cache: new InMemoryCache()
  })
})
```

Below is a config using every possible option accepted, including subscriptions and other useful Apollo packages

```js
import withApollo from 'next-with-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { GRAPHQL_URL, WS_URL } from '../configs'

export default withApollo({
  // Link can also be a function that receives: { headers }
  link: ({ headers }) => ({
    http: new HttpLink({
      uri: GRAPHQL_URL
    }),
    // WebSockets - Client side only
    ws: () =>
      new WebSocketLink({
        uri: WS_URL,
        options: {
          reconnect: true,
          connectionParams: {
            authorization: 'Bearer xxx'
          }
        }
      }),
    // using apollo-link-context
    setContext: async ({ headers }) => ({
      headers: {
        ...headers,
        authorization: 'Bearer xxx'
      }
    }),
    // using apollo-link-error
    onError: ({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(err =>
          console.log(`[GraphQL error]: Message: ${err.message}`)
        )
      }
      if (networkError) console.log(`[Network error]: ${networkError}`)
    }
  }),
  // by default the following props are added to the client: { ssrMode, link }
  client: ({ headers, link }) => ({
    cache: new InMemoryCache({
      dataIdFromObject: ({ id, __typename }) =>
        id && __typename ? __typename + id : null
    })
  })
})
```

## How it works

`next-with-apollo` will create a Higher-Order Component (HOC) with your configuration that can be used in `pages/_app` to wrap an `ApolloClient` to any Next page, it will also fetch your queries before the first page load to [hydrate the store](https://dev-blog.apollodata.com/how-server-side-rendering-works-with-react-apollo-20f31b0c7348)
