const dir = 'test'

module.exports = {
  referenceDir: `${dir}/reference`,
  testDir: `${dir}/screenshots`,
  viewports: [
    {
      name: 'desktop',
      width: 1280,
      height: 1080,
    },
    {
      name: 'mobile',
      width: 375,
      height: 667,
    },
  ],
  env: {
    SRC_DIR: '/build',
    TEST_URL: 'http://127.0.0.1',
    TEST_PORT: 4444,
  },
}
