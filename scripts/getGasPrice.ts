const fs = require("fs");

function ethPrice() {
    // https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
    const https = require('https');

    let url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

    https.get(url,(res: any) => {
        let body = "";

        res.on("data", (chunk: any) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
                let json = JSON.parse(body);
                return json.ethereum.usd
            } catch (error) {
                console.error(error.message);
            };
        });

    }).on("error", (error: any) => {
        console.error(error.message);
    });

    return null

}

export function getGasPrice() {
    const https = require('https');

    let url = "https://bscgas.info/gas";

    let gasPrice = null

    https.get(url,(res: any) => {
        let body = "";

        res.on("data", (chunk: any) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
                let json = JSON.parse(body);
                gasPrice = Number(json.fast)

                let price = gasPrice * 0.000000001  // gwei to eth

                price = price * Number(ethPrice())  // eth to usd

                return price
            } catch (error) {
                console.error(error.message);
            };
        });

    }).on("error", (error: any) => {
        console.error(error.message);
    });

    return null
}