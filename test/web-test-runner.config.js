import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: ['test/test.js'],
  plugins: [
    esbuildPlugin({
      ts: true,
    }),
  ],
  coverageConfig: {
    report: true,
    include: ['src/**/*'],
  },
}
