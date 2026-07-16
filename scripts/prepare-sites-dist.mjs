import { mkdir, readFile, writeFile } from 'node:fs/promises';

const projectId = 'appgprj_6a58bca9e8148191a9eca0337a1f2c3a';
let html = await readFile('dist/index.html', 'utf8');

const cssHref = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]+src="([^"]+)"><\/script>/)?.[1];

if (cssHref) {
  const css = await readFile(`dist/${cssHref.replace(/^\//, '')}`, 'utf8');
  html = html.replace(/<link rel="stylesheet"[^>]+href="[^"]+">/, `<style>${css}</style>`);
}

if (jsSrc) {
  const js = await readFile(`dist/${jsSrc.replace(/^\//, '')}`, 'utf8');
  html = html.replace(/<script type="module"[^>]+src="[^"]+"><\/script>/, `<script type="module">${js}</script>`);
}

await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });

await writeFile('dist/.openai/hosting.json', `${JSON.stringify({ project_id: projectId })}\n`);

await writeFile('dist/server/index.js', `const html = ${JSON.stringify(html)};

export default {
  async fetch() {
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  },
};
`);
