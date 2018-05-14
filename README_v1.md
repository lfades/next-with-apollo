# next-with-apollo
Apollo HOC for Next.js

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
    http: ({ headers }) => new HttpLink({
      uri: GRAPHQL_URL,
      credentials: 'same-origin',
      headers
    })
  }
})
```

Wrap your Next page
```js
import withApollo from '../lib/withApollo'

export default withApollo(props => (
  <h1>Hello World!</h1>
))
```

### Apollo-boost
You can also use [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) instead
```js
// lib/withApollo.js
import withApollo from 'next-with-apollo'
import ApolloClient from 'apollo-boost'
import { GRAPHQL_URL } from '../configs'

export default withApollo({
  client: new ApolloClient({ uri: GRAPHQL_URL })
})
```

## How it works
`next-with-apollo` will create a Higher-Order Component (HOC) with your configuration that can be used to wrap an `Apollo client` to any `Next` page, it will also fetch your queries before the first page load to [hydrate the store on SSR](https://dev-blog.apollodata.com/how-server-side-rendering-works-with-react-apollo-20f31b0c7348)

## Advanced Usage
Below is a config using every possible option accepted by the package, very similar to my own config in an app with a lot of Apollo features
```js
import withApollo from 'next-with-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import auth from '../auth'
import { GRAPHQL_URL, WS_URL } from '../configs'

export default withApollo({
  // this will forbid the HOC from creating a static getInitialProps
  // useful if you don't want to do SSR or don't like statics
  getInitialProps: false,

  link: {
    // This is the first link created, you can modify it here before
    // the other links do their things
    http: ({ headers }) => {
      if (!process.browser && headers) {
        headers.ssr = '1'
      }

      return new HttpLink({
        uri: GRAPHQL_URL,
        credentials: 'same-origin',
        headers
      })
    },
    // using apollo-link-context
    setContext: async ({ headers }) => ({
      headers: {
        ...headers,
        authorization: await auth.getAccessToken()
      }
    }),
    // WebSockets - Client side only
    ws: () =>
      new WebSocketLink({
        uri: WS_URL,
        options: {
          reconnect: true,
          connectionParams: {
            authorization: auth.getAccessToken()
          }
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
  },
  // by default the following props are added to the client: { ssrMode, link }
  // you can modify `link` here before creating the client
  client: ({ headers, link }) => ({
    cache: new InMemoryCache({
      dataIdFromObject: ({ id, __typename }) =>
        id && __typename ? __typename + id : null
    })
  })
})
```

You can also use a static prop that comes with the HOC to get the initial apollo props, specially useful when you have multiple HOCs for a page but you just don't want to be cloning statics all the time, here's an example
```js
// lib/withData.js
import withApollo from './withApollo'

// Very useful HOC to group all the getInitialProps in one place
const withInitialProps = ({ getInitialProps }) => Child => {
  Child.getInitialProps = async ctx => {
    const props = {
      ...(await withApp.getInitialProps(ctx)),
      ...(await withAuth.getInitialProps(ctx)),
      ...(getInitialProps ? await getInitialProps(ctx) : {})
    }

    Object.assign(props, await withApollo.getInitialProps(Child)(ctx, props))

    return props
  }
  return Child
}

export default Child =>
  compose(
    // fancy hocs
    withInitialProps(Child),
    withSentry,
    withAuth,
    withApollo,
    withRedux(getReducer(Child)),
    withAppLayout(Child.layout),
    withApp
  )(Child)
```
In the above example you will not need to care at all about the HOCs cloning statics and it just looks very clean
