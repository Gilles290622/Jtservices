import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Supprimez les imports dynamiques pour plugins dev si vous n'en avez plus besoin
// (inlineEditPlugin et editModeDevPlugin étaient pour mode édition visuelle, probablement lié à Horizon)

export default defineConfig({
  plugins: [
    react()  // Gardez le plugin React
  ],
  server: {
    cors: true,  // Gardez si nécessaire pour API comme Supabase
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless'  // Sécurité, gardez ou supprimez selon besoins
    },
    allowedHosts: true  // Attention : moins sécurisé, supprimez en prod si possible
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src')  // Alias pour src/, utile
    }
  },
  build: {
    rollupOptions: {
      external: [  // Gardez si vous excluez Babel (sinon supprimez)
        '@babel/parser',
        '@babel/traverse',
        '@babel/generator',
        '@babel/types'
      ]
    }
  }
});