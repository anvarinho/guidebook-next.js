module.exports = {
  apps : [{
    name: 'frontend',
    script: require.resolve('next/dist/bin/next'),
    args: 'start --hostname 127.0.0.1',
    cwd: __dirname,
    // Use the Node runtime that launched PM2 (Node 22+), not a stale npm shim.
    interpreter: process.execPath,
    exec_mode: 'fork',
    node_args: ['--max-old-space-size=384'],
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
