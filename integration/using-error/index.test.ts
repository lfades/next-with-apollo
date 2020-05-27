import nock from 'nock';
import { nextBuild, nextExport } from '../next-test-utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 30;

beforeEach(() => {
  // Fake GraphQL server
  nock('http://mocked.com')
    .post(`/graphql`)
    .reply(200, {
      data: {
        hire: { __typename: 'User', id: 'uniqueid', name: 'Next Apollo' }
      }
    });
});

describe('Using onError', () => {
  it('breaks build from GraphQL Error', async () => {
    const appDir = __dirname;
    await nextBuild(appDir);
    const { stderr } = await nextExport(appDir, [], { stderr: true });
    expect(stderr).toMatch('render error');
  });
});
