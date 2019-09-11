# next-with-apollo

Apollo HOC for Next.js

For `Next v9` use the latest version

For `Next v6-v8` use the version `3.4.0`

For `Next v5` and lower go [here](./README_v1.md) and use the version `1.0`.

## How to use

Install the package with npm

```sh
npm install next-with-apollo
```

or with yarn

```sh
yarn add next-with-apollo
```

> Note: [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) is used in this example because is the fastest way to create an `ApolloClient`, but is not required. </br>
> Previously this package had some configs to create an `ApolloClient`, those were removed but you can see an example of how to create the same `ApolloClient` by yourself [here](https://github.com/lfades/next-with-apollo/issues/13#issuecomment-390289449).

Create the HOC using a basic setup and [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost):

```js
// lib/withApollo.js
import withApollo from 'next-with-apollo';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { GRAPHQL_URL } from '../configs';

export default withApollo(
  ({ ctx, headers, initialState }) =>
    new ApolloClient({
      uri: GRAPHQL_URL,
      cache: new InMemoryCache().restore(initialState || {})
    })
);
```

`withApollo` accepts a function that receives `{ ctx, headers }` in the first render with SSR (Server Side Rendering). This is done to fetch your queries and [hydrate the store](https://dev-blog.apollodata.com/how-server-side-rendering-works-with-react-apollo-20f31b0c7348)
before we send the page to the browser.

`withApollo` will receive `{ initialState }` if the render is happening in the browser, with the following line we're hydrating our cache with the initial state created in the server:

```js
cache: new InMemoryCache().restore(initialState || {});
```

Now let's wrap Next's `App` in `pages/_app.js`:

```js
import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloProvider } from 'react-apollo';
import withApollo from '../lib/withApollo';

class MyApp extends App {
  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
```

> Note: If using `react-apollo`, you will need to import the `ApolloProvider` from `react-apollo` instead of `@apollo/react-hooks`.

Now every page in `pages/` can use anything from `@apollo/react-hooks` or `react-apollo`. Pages can access the `ApolloClient` too:

```js
Page.getInitialProps = ctx => {
  const apolloClient = ctx.apolloClient;
};
```

**withApollo** can also receive some options as second parameter:

| Key               | Type     | Default  | Note                                                                                                                                                  |
| ----------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getDataFromTree` | `string` | `always` | Should the apollo store be hydrated before the first render?, allowed values are `always`, `never` or `ssr` (don't hydrate on client side navigation) |

Usage example:

```js
export default withApollo(() => new ApolloClient({ uri: GRAPHQL_URL }), {
  getDataFromTree: 'always'
});
```
