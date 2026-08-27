import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Readable } from 'stream'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'apk-download-proxy',
      configureServer(server) {
        const handleDownload = async (req, res) => {
          try {
            // Fetch initial Drive page to extract fresh security UUID token for large files
            const drivePageRes = await fetch("https://drive.usercontent.google.com/download?id=1RZndlwHAhG27lOgaaMvC575qruQ0CgE9&export=download");
            const html = await drivePageRes.text();
            const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/);
            const uuid = uuidMatch ? uuidMatch[1] : '';

            // Fetch direct binary response
            const downloadUrl = `https://drive.usercontent.google.com/download?id=1RZndlwHAhG27lOgaaMvC575qruQ0CgE9&export=download&authuser=0&confirm=t&uuid=${uuid}`;
            const response = await fetch(downloadUrl);

            res.setHeader(
              "Content-Disposition",
              'attachment; filename="QuickQuotes.apk"'
            );
            res.setHeader(
              "Content-Type",
              "application/vnd.android.package-archive"
            );
            if (response.headers.get("content-length")) {
              res.setHeader("Content-Length", response.headers.get("content-length"));
            }

            if (response.body) {
              Readable.fromWeb(response.body).pipe(res);
            } else {
              res.writeHead(302, { Location: downloadUrl });
              res.end();
            }
          } catch (err) {
            console.error("APK Download Proxy Error:", err);
            res.writeHead(302, { Location: "https://drive.usercontent.google.com/download?id=1RZndlwHAhG27lOgaaMvC575qruQ0CgE9&export=download&confirm=t" });
            res.end();
          }
        };

        server.middlewares.use('/api/download-app', handleDownload);
        server.middlewares.use('/api/download-apk', handleDownload);
      }
    }
  ],
})
