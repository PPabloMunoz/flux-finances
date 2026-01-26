import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  build: {
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    target: 'esnext',
    cssTarget: 'chrome120',
  },
  plugins: [
    viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    nitro({ preset: 'bun' }),
  ],
})

export default config
