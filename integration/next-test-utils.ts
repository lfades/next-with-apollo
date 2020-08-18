import path from 'path';
import http from 'http';
import spawn from 'cross-spawn';
import nextServer from 'next';
import fetch, { RequestInit } from 'node-fetch';

/**
 * These utils are very similar to the ones used by Next.js in their tests
 */

type FirstArgument<T> = T extends (arg: infer U) => any ? U : any;

type NextServerOptions = FirstArgument<typeof nextServer>;

type NextCommandOptions = {
  env?: any;
  stderr?: boolean;
  stdout?: boolean;
};

function promiseCall(obj: any, method: string, ...args: any) {
  return new Promise((resolve, reject) => {
    const newArgs = [
      ...args,
      function(err: Error, res: any) {
        if (err) return reject(err);
        resolve(res);
      }
    ];

    obj[method](...newArgs);
  });
}

export { nextServer };

export async function startApp(options: NextServerOptions) {
  const app = nextServer(options);

  await app.prepare();

  const handler = app.getRequestHandler();
  const server = http.createServer(handler);

  (server as any).__app = app;

  await promiseCall(server, 'listen');

  return server;
}

export async function stopApp(server: http.Server) {
  const app = (server as any)._app;

  if (app) await app.close();
  await promiseCall(server, 'close');
}

export function runNextCommand(
  args: string[],
  options: NextCommandOptions = {}
) {
  const nextDir = path.dirname(require.resolve('next/package'));
  const nextBin = path.join(nextDir, 'dist/bin/next');
  const cwd = nextDir;
  const env = { ...process.env, ...options.env, NODE_ENV: '' };

  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    console.log(`Running command "next ${args.join(' ')}"`);
    const instance = spawn('node', [nextBin, ...args], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderrOutput = '';
    if (options.stderr) {
      instance.stderr!.on('data', function(chunk) {
        stderrOutput += chunk;
      });
    }

    let stdoutOutput = '';
    if (options.stdout) {
      instance.stdout!.on('data', function(chunk) {
        stdoutOutput += chunk;
      });
    }

    instance.on('close', () => {
      resolve({
        stdout: stdoutOutput,
        stderr: stderrOutput
      });
    });

    instance.on('error', (err: any) => {
      err.stdout = stdoutOutput;
      err.stderr = stderrOutput;
      reject(err);
    });
  });
}

export function nextBuild(
  dir: string,
  args: string[] = [],
  opts?: NextCommandOptions
) {
  return runNextCommand(['build', dir, ...args], opts);
}

export function nextExport(
  dir: string,
  args: string[] = [],
  opts?: NextCommandOptions
) {
  return runNextCommand(['export', dir, ...args], opts);
}

export function fetchViaHTTP(
  appPort: number,
  pathname: string,
  opts?: RequestInit
) {
  const url = `http://localhost:${appPort}${pathname}`;
  return fetch(url, opts);
}

export function renderViaHTTP(appPort: number, pathname: string) {
  return fetchViaHTTP(appPort, pathname).then(res => res.text());
}

export function extractNextData(html: string) {
  const R = /<script id=\"__NEXT_DATA__\" type=\"application\/json\">([^<]*)<\/script>/gm;
  const [, json]: any = R.exec(html);
  const { props } = JSON.parse(json);

  return props;
}
