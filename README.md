# next-with-apollo

![Actions Status](https://github.com/lfades/next-with-apollo/workflows/Node%20CI/badge.svg)

Apollo HOC for Next.js.

For `Next v9` use the latest version.

For `Next v6-v8` use the version `3.4.0`.

For `Next v5` and lower go [here](./README_v1.md) and use the version `1.0`.

## How to use

Install the package with npm:

```sh
npm install next-with-apollo
```

or with yarn:

```sh
yarn add next-with-apollo
```

Create the HOC using a basic setup and [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost):

```jsx
// lib/withApollo.js
import withApollo from 'next-with-apollo';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

export default withApollo(
  ({ initialState }) => {
    return new ApolloClient({
      uri: 'https://mysite.com/graphql',
      cache: new InMemoryCache().restore(initialState || {})
    });
  },
  {
    render: ({ Page, props }) => {
      return (
        <ApolloProvider client={props.apollo}>
          <Page {...props} />
        </ApolloProvider>
      );
    }
  }
);
```

> **Note**: [apollo-boost](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost) is used in this example because is the fastest way to create an `ApolloClient`, but is not required. </br>

> **Note**: If using `react-apollo`, you will need to import the `ApolloProvider` from `react-apollo` instead of `@apollo/react-hooks`.

Now let's use `lib/withApollo.js` in one of our pages:

```jsx
// pages/index.js
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import withApollo from '../lib/withApollo';
// import { getDataFromTree } from '@apollo/react-ssr';

const QUERY = gql`
  {
    title
  }
`;

const Index = () => {
  const { loading, data } = useQuery(QUERY);

  if (loading || !data) {
    return <h1>loading...</h1>;
  }
  return <h1>{data.title}</h1>;
};

export default withApollo(Index);

// You can also override the configs for withApollo here, so if you want
// this page to have SSR (and to be a lambda) for SEO purposes and remove
// the loading state, uncomment the import at the beginning and this:
//
// export default withApollo(Index, { getDataFromTree });
```

Now your page can use anything from `@apollo/react-hooks` or `react-apollo`. If you want to add Apollo in `_app` instead of per page, go to [Using \_app](#using-_app).

## withApollo API

`withApollo` receives 2 parameters, the first one is a function that returns the Apollo Client, this function receives an object with the following properties:

- `ctx` - This is the [context object](https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#context-object) sent by Next.js to the `getInitialProps` of your page. It's only available for SSR, in the client it will be `undefined`
- `initialState` - If `getDataFromTree` is sent, this will be the initial data required by the queries in your page, otherwise it will be `undefined`
- `headers` - This is `ctx.req.headers`, in the client it will be `undefined`.

The second, optional parameter, received by `withApollo`, is an `object` with the following props:

- `render` - A function that receives an object (`{ Page, props }`) with the current `Page` Component to be rendered, and its `props`. It can be used to wrap your pages with `<ApolloProvider>`. It's optional
- `getDataFromTree` - implementation of [`getDataFromTree`](https://www.apollographql.com/docs/react/api/react-ssr/#getdatafromtree), defaults to `undefined`. **It's recommended to never set this prop**, otherwise the page will be a lambda without [Automatic Static Optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization)
- `onError` - A function that will be called if `getDataFromTree` encounters errors. If not supplied errors will be silently ignored. It will be called with 2 parameters:
  - `error` - The [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object
  - `ctx` - The page context ([`NextPageContext`](https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#context-object))

### Using `getInitialProps`

Pages with `getInitialProps` can access the Apollo Client like so:

```jsx
Page.getInitialProps = ctx => {
  const apolloClient = ctx.apolloClient;
};
```

Next.js applies very good optimizations by default, including [Automatic Static Optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization), and as long as the `getDataFromTree` config is not added, your pages will always be static and can be served directly from a CDN, instead of having a serverless function being executed for every new request, which is also more expensive.

If your page has `getDataFromTree` to remove the loading states of Apollo Queries, you should consider handling the loading states by yourself, fetching all queries per request and before sending the initial HTML will slow down the first render, and the user may end up waiting a long time without any feedback.

## Using \_app

If you want to add Apollo to all pages, you can use `pages/_app.js`, like so:

```jsx
import withApollo from 'next-with-apollo';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient, { InMemoryCache } from 'apollo-boost';

const App = ({ Component, pageProps, apollo }) => (
  <ApolloProvider client={apollo}>
    <Component {...pageProps} />
  </ApolloProvider>
);

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    uri: 'https://mysite.com/graphql',
    cache: new InMemoryCache().restore(initialState || {})
  });
})(App);
```

It's better to add Apollo in every page instead if you have pages that don't need Apollo.

To [access Apollo Client in each page's `getInitialProps`](#using-getinitialprops), add `getInitialProps` to `App` like so:

```javascript
import App from 'next/app';

MyApp.getInitialProps = async appContext => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};
```

If you either add the `getDataFromTree` config or `getInitialProps`, it will turn all pages into lambdas and disable [Automatic Static Optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization).

## Migration guide

### from 4.3.0 to 5.0.0

In `4.3.0` all the queries where fetched on server by default (`getDataFromTree` option [was](https://github.com/lfades/next-with-apollo/commit/5e281c4367ccbfd4577f260eeb2494f4cc5413ea#diff-04c6e90faac2675aa89e2176d2eec7d8L92) set to `'always'` by default). In order to get the same behaviour in `5.0.0` you need to explicitly pass `getDataFromTree` (from `@apollo/react-ssr`) to [`withApollo`](#withapollo-api).
