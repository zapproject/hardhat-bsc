module.exports = {
  apps: [{
    name: "Zap-Hardhat",
    script: "./start.sh",
    env: {
      port: 8545,
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}