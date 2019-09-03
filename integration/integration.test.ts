import getPort from 'get-port';
import { createServer } from 'http';
import next from 'next';
import nock from 'nock';
import f from 'node-fetch';
import path from 'path';

let port = 3000;
const projectDir = path.resolve(__dirname, './__fixture__');

let app: any;
let server;

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

beforeEach(() => {
  // Fake graphql server
  nock('http://mocked.com')
    .post(`/graphql`)
    .reply(200, {
      data: {
        hire: { __typename: 'User', id: 'uniqueid', name: 'Lewis Blackwood' }
      }
    });
});

describe('react-apollo support', () => {
  it('loads <Query /> data on the server', async () => {
    const html = await loadPage();
    expect(html).toContain('<p>Lewis Blackwood</p>');

    const { apolloState } = extractNextData(html);
    expect(apolloState).toMatchSnapshot();
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
