import nock from 'nock';
import {
  nextServer,
  nextBuild,
  startApp,
  renderViaHTTP
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

describe('Using _app without SSR', () => {
  describe('react-apollo support', () => {
    it('loads <Query /> data on the client', async () => {
      const html = await renderViaHTTP(appPort, '/');
      expect(html).toContain('<p>loading</p>');
    });
  });

  describe('@apollo/react-hooks support', () => {
    it('loads useQuery data on the client', async () => {
      const html = await renderViaHTTP(appPort, '/hooks');
      expect(html).toContain('<p>loading</p>');
    });
  });

  describe('ssr smoke', () => {
    it('useRouter is never null', async () => {
      const html = await renderViaHTTP(appPort, '/router');

      if (!html.includes('<p>all good</p>')) {
        throw new Error(`
          The built in next hook useRouter() returned null during a render.
          getDataFromTree should be called on AppTree no App so the Context
          is always provided.
        `);
      }
    });
  });
});
