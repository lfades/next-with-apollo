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

export default withApollo(({ headers }) => (
  new ApolloClient({ uri: GRAPHQL_URL })
))
```

> `withApollo` accepts a function that receives `{ headers }` and returns an `ApolloClient`, keep in mind `headers` are SSR only

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

> Note: [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) is used in this example because is the fastest way to create an `ApolloClient`, but is not required.
>
> Previously this package had some configs to create an `ApolloClient`, those were removed but you can see an example of how to create the same `ApolloClient` yourself [here](https://github.com/lfades/next-with-apollo/issues/13#issuecomment-390289449)

**withApollo** can also receive some options as second parameter:

| Key | Type | Default | Note |
| --- | ---- | ------- | ---- |
| `getDataFromTree` |  `string` | `always` | Should the apollo store be hydrated before the first render ?, allowed values are `always`, `never` or `ssr` (don't hydrate on client side navigation)

Usage example:

```js
export default withApollo(
  () => new ApolloClient({ uri: GRAPHQL_URL }),
  {
    getDataFromTree: 'always'
  }
)
```

## How it works

`next-with-apollo` will create a Higher-Order Component (HOC) with your configuration that can be used in `pages/_app` to wrap an `ApolloClient` to any Next page, it will also fetch your queries before the first page load to [hydrate the store](https://dev-blog.apollodata.com/how-server-side-rendering-works-with-react-apollo-20f31b0c7348)
