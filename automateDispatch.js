var shell = require('shelljs');
var cron = require('node-cron');

function send(){
    shell.exec('npx hardhat --network localhost dispatchCGPriceClient')
}
console.log("Starting Dispatch Cycle")
cron.schedule('*/2 * * * *', () => {
    send()
    console.log('running send every two minutes');
});