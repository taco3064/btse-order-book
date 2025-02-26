import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

import { name } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV !== 'production' ? '/' : `/${name}`,
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    open: true,
  },
});
