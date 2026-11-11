module.exports = {
  apps : [{
    name: 'frontend',
    script: require.resolve('next/dist/bin/next'),
    args: 'start --hostname 127.0.0.1',
    cwd: __dirname,
    // Run as an unprivileged user; its Node copy lives outside /root (which it cannot read).
    // After every `next build` (run as root): chown -R guidebook-web:guidebook-web .next-build
    interpreter: '/usr/local/lib/guidebook-node/bin/node',
    uid: 'guidebook-web',
    gid: 'guidebook-web',
    exec_mode: 'fork',
    node_args: ['--max-old-space-size=256'],
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    instances: 1,
    autorestart: true,
    max_memory_restart: '320M',
    env: {
      NODE_ENV: 'production',
      HOME: '/var/lib/guidebook-web',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }],
};
