import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Vários testes percorrem as 150 aulas inteiras (todas as atividades e sessões);
    // em máquinas de CI mais lentas eles passam dos 5 s padrão.
    testTimeout: 60_000,
  },
});
