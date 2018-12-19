import withApollo, { initApollo } from '../';

it('Should have the required exports', () => {
  expect(withApollo).toBeDefined();
  expect(initApollo).toBeDefined();
});
