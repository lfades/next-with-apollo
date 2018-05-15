import withApollo, { ApolloApp, initApollo } from '../';

it('Should have the required exports', () => {
  expect(withApollo).toBeDefined();
  expect(initApollo).toBeDefined();
  expect(ApolloApp).toBeDefined();
});
