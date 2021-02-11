module.exports = {
  apps : [{
    name: 'zap-hardhat',
    script: './start.sh',
    interpreter: '/bin/sh',
    instances: 1,
    autorestart: true,
  }]
};
