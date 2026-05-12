module.exports = {
  apps: [
    {
      name: "nexam-server",
      script: "index.js",
      instances: "max",          // Use all CPU cores
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Auto-restart settings
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 10,
      // Logging
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
