import React from 'react';
import { object } from 'prop-types';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import Head from 'next/head';
import initApollo from './apollo';

// Gets the display name of a JSX component for dev tools
function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Unknown';
}

export default function withApollo(options) {
  const getApolloProps = Child => async (ctx, childProps) => {
    const { req, asPath, pathname, query } = ctx;
    const headers = req ? req.headers : {};
    const props = { apolloState: null };

    if (!process.browser) {
      const apollo = initApollo(options, headers);

      try {
        await getDataFromTree(
          <Child {...props} {...childProps} apollo={apollo} />,
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

  function withApolloHOC(Child) {
    let getInitialProps;

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

    return class WithApollo extends React.Component {
      static displayName = `WithApollo(${getDisplayName(Child)})`;

      static propTypes = {
        apolloState: object,
        apollo: object
      };

      static getInitialProps = getInitialProps;

      constructor(props) {
        super(props);

        this.apollo =
          props.apollo || initApollo(options, null, props.apolloState);
      }

      render() {
        return (
          <ApolloProvider client={this.apollo}>
            <Child {...this.props} />
          </ApolloProvider>
        );
      }
    };
  }

  withApolloHOC.getInitialProps = getApolloProps;

  return withApolloHOC;
}
