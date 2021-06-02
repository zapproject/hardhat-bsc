const fs = require("fs");

// Gets the Eth Gas Price from EthGasStation
export function getGasPrice() {
    const axios = require("axios")

    axios.get('https://ethgasstation.info/json/ethgasAPI.json')
    .then((res: any)=>{
        // console.log(typeof Number.parseInt(res.data.fastest))
        fs.writeFile("./output/gas.txt", (res.data.fastest / 10).toString(), function(err: any){
            console.log(err)
        })
    })
    .catch((err: any)=>{
        console.log(err)
        return null
    })
}

export function getBSCGasPrice() {
    const axios = require("axios")

    axios.get('https://bscscan.com/chart/gasprice?output=csv')
    .then((res: any)=>{
        let csv = res.data
        // split response into an array of
        // each line in response is an element
        csv = csv.split("\r\n")

        // the latest BSC gas price is the last element of the last line
        let latestGas = csv[csv.length - 2].split(",")
        latestGas = latestGas[latestGas.length - 1]

        if (!fs.existsSync("./output")){
            fs.mkdirSync("./output")
        }

        // write latest gas price to file
        fs.writeFile("./output/bscGas.txt", (latestGas), function(err: any){
            console.log(err)
        })
    })
    .catch((err: any)=>{
        console.log(err)
        return null
    })
}