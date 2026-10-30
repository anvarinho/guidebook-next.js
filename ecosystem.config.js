module.exports = {
  apps : [{
    name: 'frontend',
    script: require.resolve('next/dist/bin/next'),
    args: 'start',
    cwd: __dirname,
    // Use the Node runtime that launched PM2 (Node 22+), not a stale npm shim.
    interpreter: process.execPath,
    exec_mode: 'fork',
    node_args: ['--max-old-space-size=256'],
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }],
};
