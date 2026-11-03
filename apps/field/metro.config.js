const { getDefaultConfig } = require('expo/metro-config');
const http = require('node:http');

const config = getDefaultConfig(__dirname);
if (process.env.FLAHA_IPHONE_PILOT === '1') {
  const allowed = new Set([
    'POST /v1/auth/login',
    'POST /v1/auth/refresh',
    'GET /v1/projects?archived=false',
  ]);
  const enhance = config.server.enhanceMiddleware;
  config.server.enhanceMiddleware = (middleware, server) => {
    const metro = enhance ? enhance(middleware, server) : middleware;
    return (req, res, next) => {
      const sync = process.env.FLAHA_PILOT_SYNC === '1';
      if (sync && (req.url.startsWith('/v1/') || req.url.startsWith('/files/'))) {
        // The loopback gateway validates routes, tokens, upload ownership and payload size.
        const headers = {};
        for (const key of ['authorization','content-type','content-length','upload-length','upload-offset','tus-resumable']) {
          if (req.headers[key]) headers[key] = req.headers[key];
        }
        // The Expo HTTPS tunnel can drop TUS HEAD requests. Relay these two explicit
        // POST routes to the existing TUS gateway, which still verifies upload ownership.
        const transfer = req.method === 'POST' && /^\/v1\/phone-upload\/(offset|chunk)\/([a-zA-Z0-9._+%-]+)$/.exec(req.url);
        let method = req.method;
        let path = req.url;
        if (transfer) {
          const id = transfer[2].replace(/%2b/ig, '+');
          if (!/^[a-zA-Z0-9._+-]+$/.test(id)) return res.writeHead(400).end();
          path = '/files/' + id;
          method = transfer[1] === 'offset' ? 'HEAD' : 'PATCH';
        }
        const roleGateway = process.env.FLAHA_ROLE_TEST_SLOT === '2' ? 19019 : 18019;
        const proxy = http.request({ hostname: '127.0.0.1', port: process.env.FLAHA_ROLE_TEST === '1' ? roleGateway : 3019, method, path, headers },
          upstream => { res.writeHead(upstream.statusCode, upstream.headers); upstream.pipe(res); });
        proxy.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
        req.on('aborted', () => proxy.destroy());
        return req.pipe(proxy);
      }
      if (!req.url.startsWith('/v1/')) return metro(req, res, next);
      if (!allowed.has(req.method + ' ' + req.url)) {
        res.writeHead(404).end();
        return;
      }
      const headers = { 'content-type': 'application/json' };
      if (req.headers.authorization) headers.authorization = req.headers.authorization;
      const upstream = http.request({
        hostname: '127.0.0.1', port: 3017, method: req.method, path: req.url, headers,
        timeout: 10000,
      }, response => {
        res.writeHead(response.statusCode, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        response.pipe(res);
      });
      upstream.on('timeout', () => upstream.destroy());
      upstream.on('error', () => {
        if (!res.headersSent) res.writeHead(502);
        res.end();
      });
      req.on('aborted', () => upstream.destroy());
      req.pipe(upstream);
    };
  };
}
module.exports = config;
