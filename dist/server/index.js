const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>نظام ضبط العدوى - يداً بيد</title>
    <script type="module" crossorigin src="/assets/index-Bi9YZCKr.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DsPtWM1e.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

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
