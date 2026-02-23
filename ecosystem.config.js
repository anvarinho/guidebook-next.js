module.exports = {
  apps : [{
    name: 'frontend',
    script: 'npm',
    args: 'start',
    cwd: './',  // Current working directory
    watch: true,
    ignore_watch: ['node_modules', 'logs'],
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }],
};
