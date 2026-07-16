import { mkdir, readFile, writeFile } from 'node:fs/promises';

const projectId = 'appgprj_6a58bca9e8148191a9eca0337a1f2c3a';
let html = await readFile('dist/index.html', 'utf8');

const cssHref = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]+src="([^"]+)"><\/script>/)?.[1];
const assets = {};

if (cssHref) {
  assets[cssHref] = {
    body: await readFile(`dist/${cssHref.replace(/^\//, '')}`, 'utf8'),
    type: 'text/css; charset=utf-8',
  };
}

if (jsSrc) {
  assets[jsSrc] = {
    body: await readFile(`dist/${jsSrc.replace(/^\//, '')}`, 'utf8'),
    type: 'text/javascript; charset=utf-8',
  };
}

await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });

await writeFile('dist/.openai/hosting.json', `${JSON.stringify({ project_id: projectId })}\n`);

await writeFile('dist/server/index.js', `const html = ${JSON.stringify(html)};
const assets = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets[url.pathname];

    if (asset) {
      return new Response(asset.body, {
        headers: {
          'content-type': asset.type,
          'cache-control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  },
};
`);
