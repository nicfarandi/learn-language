module.exports = ({ config }) => ({
  ...config,
  extra: { ...config.extra, builtAt: new Date().toISOString() },
});
