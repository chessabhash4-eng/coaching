import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiPlugin(): Plugin {
  return {
    name: 'vite-api-handlers',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();
        const urlObj = new URL(req.url, 'http://localhost');
        const endpoint = urlObj.pathname.replace(/^\/api\//, '').split('/')[0];
        try {
          const mod = await server.ssrLoadModule(`./api/${endpoint}.js`);
          const handler = mod.default || mod;
          if (typeof handler === 'function') {
            (res as any).status = (code: number) => {
              res.statusCode = code;
              return res;
            };
            (res as any).json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            (req as any).query = Object.fromEntries(urlObj.searchParams.entries());

            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  (req as any).body = body ? JSON.parse(body) : {};
                } catch {
                  (req as any).body = body;
                }
                try {
                  await handler(req, res);
                } catch (err: any) {
                  console.error(`[API error in ${endpoint}.js]:`, err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
              return;
            }

            await handler(req, res);
            return;
          }
        } catch (e: any) {
          console.error(`[API loader error on ${req.url}]:`, e);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message }));
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_']);
  Object.assign(process.env, env);

  const plugins: any[] = [react(), tailwindcss(), apiPlugin()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
