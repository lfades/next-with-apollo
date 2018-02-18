import ApolloClient from 'apollo-client';
import Head from 'next/head';
import PropTypes from 'prop-types';
import React from 'react';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import initApollo from './apollo';
import {
  GetApolloProps,
  GetInitialProps,
  InitApolloOptions,
  WithApolloHOC,
  WithApolloProps
} from './types';

// Gets the display name of a JSX component for dev tools
function getDisplayName(Component: React.ComponentType) {
  return Component.displayName || Component.name || 'Unknown';
}

export default function withApollo<TCache = any>(
  options: InitApolloOptions<TCache>
) {
  type ApolloProps = WithApolloProps<TCache>;

  const getApolloProps: GetApolloProps<TCache> = Child => async (
    ctx,
    childProps
  ) => {
    const { req, asPath, pathname, query } = ctx;
    const headers = req ? req.headers : {};
    const props: { apolloState?: TCache } = {};

    if (!process.browser) {
      const apollo = initApollo<TCache>(options, headers);

      try {
        await getDataFromTree(
          <Child {...childProps} {...props} apollo={apollo} />,
          { router: { asPath, pathname, query } }
        );
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
      }
      // Make sure to only include Apollo's data state
      props.apolloState = apollo.cache.extract();

      Head.rewind();
    }

    return props;
  };

  const withApolloHOC = (Child: any) => {
    let getInitialProps: GetInitialProps;

    if (options.getInitialProps !== false) {
      getInitialProps = async ctx => {
        let childProps = {};
        if (Child.getInitialProps) {
          childProps = await Child.getInitialProps(ctx);
        }

        return {
          ...(await getApolloProps(withApolloHOC(Child))(ctx, childProps)),
          ...childProps
        };
      };
    }

    return class WithApollo extends React.Component<ApolloProps> {
      public static displayName = `WithApollo(${getDisplayName(Child)})`;

      public static propTypes = {
        apolloState: PropTypes.object,
        apollo: PropTypes.object
      };

      public static getInitialProps = getInitialProps;

      public apollo: ApolloClient<TCache>;

      constructor(props: ApolloProps) {
        super(props);

        this.apollo =
          props.apollo ||
          initApollo<TCache>(options, undefined, props.apolloState);
      }

      public render() {
        return (
          <ApolloProvider client={this.apollo}>
            <Child {...this.props} />
          </ApolloProvider>
        );
      }
    };
  };

  return Object.assign(withApolloHOC, {
    getInitialProps: getApolloProps
  }) as WithApolloHOC<TCache>;
}
