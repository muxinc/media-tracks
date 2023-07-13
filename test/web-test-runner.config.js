export default {
  nodeResolve: true,
  files: ['test/**/*.js'],
  coverageConfig: {
    report: true,
    include: ['dist/**/*'],
  },
}
