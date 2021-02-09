module.exports = {
  apps: [{
    name: "Zap-Hardhat",
    script: "./start.sh",
    exec_interpreter: "bash",
    exec_mode: fork_mode
  }]
}