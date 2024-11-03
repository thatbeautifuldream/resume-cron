module.exports = {
  apps: [{
    name: "resume-cron",
    script: "index.js",
    watch: true,
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
