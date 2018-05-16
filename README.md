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

Create the HOC using a basic setup

```js
// lib/withApollo.js
import withApollo from 'next-with-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { GRAPHQL_URL } from '../configs'

export default withApollo({
  client: () => ({
    cache: new InMemoryCache()
  }),
  link: {
    http: new HttpLink({
      uri: GRAPHQL_URL
    })
  }
})
```

And wrap Next's `App` in `pages/_app.js`

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

### apollo-boost

You can also use [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) instead

```js
// lib/withApollo.js
import withApollo from 'next-with-apollo'
import ApolloClient from 'apollo-boost'
import { GRAPHQL_URL } from '../configs'

export default withApollo({
  client: new ApolloClient({ uri: GRAPHQL_URL })
  // This works too, keep in mind headers are SSR only
  // client: ({ headers }) => new ApolloClient({ uri: GRAPHQL_URL })
})
```

### Advanced options

Below is a config using every possible option accepted by the package, very useful when you're getting deeper with the Apollo packages

```js
import withApollo from 'next-with-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { GRAPHQL_URL, WS_URL } from '../configs'

export default withApollo({
  // Link can also be a function that receives: { headers }
  link: options => ({
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
  client: ({ headers }) => ({
    cache: new InMemoryCache({
      dataIdFromObject: ({ id, __typename }) =>
        id && __typename ? __typename + id : null
    })
  })
})
```

## How it works

`next-with-apollo` will create a Higher-Order Component (HOC) with your configuration that can be used in `pages/_app` to wrap an `ApolloClient` to any Next page, it will also fetch your queries before the first page load to [hydrate the store](https://dev-blog.apollodata.com/how-server-side-rendering-works-with-react-apollo-20f31b0c7348)
