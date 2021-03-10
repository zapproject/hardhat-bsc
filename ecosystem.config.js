module.exports = {
  apps : [{
    name: 'zap-hardhat',
    script: './start.sh',
    instances: 1,
    interpreter: '/bin/sh'
  }]
};
