module.exports = {
  apps: [
    {
      name: "inventory-backend",
      script: "node ./dist/index.js",
      cwd: "./inventory-backend",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "inevntory-frontend",
      script: "npm",
      args: "start",
      cwd: "./inevntory-frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
                                                                                    1,18          Top

