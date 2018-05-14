import withApollo, {
  ApolloApp,
  App,
  Container,
  initApollo,
  WithApolloApp
} from '../';

it('Should have the required exports', () => {
  expect(withApollo).toBeDefined();
  expect(initApollo).toBeDefined();

  expect(ApolloApp).toBeDefined();
  expect(WithApolloApp).toBeDefined();

  // From next/app
  expect(App).toBeDefined();
  expect(Container).toBeDefined();
});
