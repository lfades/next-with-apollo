import nock from 'nock';
import {
  nextServer,
  nextBuild,
  nextExport,
  startApp,
  fetchViaHTTP
} from '../next-test-utils';

const appDir = __dirname;
let appPort: number;
let server: any;
let app: any;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 30;

beforeAll(async () => {
  await nextBuild(appDir);
  app = nextServer({
    dir: appDir,
    dev: false,
    quiet: true
  });
  server = await startApp(app);
  appPort = server.address().port;
});

afterAll(() => server.close());

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
  it('breaks build from unhandled GraphQL errors', async () => {
    const { stderr } = await nextExport(appDir, [], { stderr: true });
    expect(stderr).toMatch('unhandled');
  });

  it('returns 500 via context', async () => {
    const response = await fetchViaHTTP(appPort, '/invalid');
    expect(response.status).toEqual(500);
    const text = await response.text();
    expect(text).toMatch('Internal Server Error');
  });

  it('returns 404 via context', async () => {
    const response = await fetchViaHTTP(appPort, '/missing');
    expect(response.status).toEqual(404);
    const text = await response.text();
    expect(text).toMatch('Not Found');
  });
});
