import getPort from 'get-port';
import { createServer } from 'http';
import next from 'next';
import nock from 'nock';
import f from 'node-fetch';
import path from 'path';

let port = 3000;
const projectDir = path.resolve(__dirname, './__fixture__');

let app: any;
let server: any;

beforeAll(async () => {
  // Startup server
  app = next({
    dev: false,
    dir: projectDir
  });

  port = await getPort();
  await app.prepare();
  server = createServer(app.getRequestHandler());
  await server.listen(port);
});

afterAll(async () => {
  await server.close();
});

beforeEach(() => {
  // Fake graphql server
  nock('http://mocked.com')
    .post(`/graphql`)
    .reply(200, {
      data: {
        hire: { __typename: 'User', id: 'uniqueid', name: 'Next Apollo' }
      }
    });
});

describe('react-apollo support', () => {
  it('loads <Query /> data on the server', async () => {
    const html = await loadPage();
    expect(html).toContain('<p>Next Apollo</p>');

    const { apolloState } = extractNextData(html);
    expect(apolloState).toMatchSnapshot();
  });
});

describe('@apollo/react-hooks support', () => {
  it('loads useQuery data on the server', async () => {
    const html = await loadPage('/hooks');
    expect(html).toContain('<p>Next Apollo</p>');

    const { apolloState } = extractNextData(html);
    expect(apolloState).toMatchSnapshot();
  });
});

describe('ssr smoke', () => {
  it('useRouter is never null', async () => {
    const html = await loadPage('/router');

    if (!html.includes('<p>all good</p>')) {
      throw new Error(`
        The built in next hook useRouter() returned null during a render.
        getDataFromTree should be called on AppTree no App so the Context
        is always provided.
      `);
    }
  });
});

async function loadPage(p = '') {
  const response = await f(`http://localhost:${port}${p}`);
  const html = await response.text();
  return html;
}

function extractNextData(html: string) {
  const R = /<script id=\"__NEXT_DATA__\" type=\"application\/json\">([^<]*)<\/script>/gm;
  const [, json]: any = R.exec(html);
  const { props } = JSON.parse(json);
  return props;
}
