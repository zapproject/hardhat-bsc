const fs = require("fs");

export function ethPrice() {
    // https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
    const axios = require("axios")
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    .then((res: any)=>{
        fs.writeFile("./output/eth_usd.txt", res.data.ethereum.usd.toString(), function(err: any){
            console.log(err)
        })
    })
    .catch((err: any)=>{
        console.log(err)
        return null
    })

}

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