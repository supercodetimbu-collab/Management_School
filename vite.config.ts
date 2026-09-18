import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          id: './',
          name: 'SIAKAD SEKOLAH — Sistem Informasi Akademik Sekolah',
          short_name: 'SIAKAD',
          description: 'Sistem Informasi Akademik Sekolah modern, responsif, dan siap operasional.',
          theme_color: '#0d9488',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
      {
        name: 'generate-404-fallback',
        closeBundle() {
          try {
            const cwd = process.cwd();
            const indexPath = path.resolve(cwd, 'dist', 'index.html');
            const notFoundPath = path.resolve(cwd, 'dist', '404.html');
            if (fs.existsSync(indexPath)) {
              fs.copyFileSync(indexPath, notFoundPath);
            }
          } catch (err) {
            console.warn('Could not copy 404.html fallback', err);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
