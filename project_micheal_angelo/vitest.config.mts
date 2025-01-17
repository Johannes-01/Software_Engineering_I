import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import * as path from "path"

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@utils': path.resolve(__dirname, './src/utils'),
        },
    },
});
