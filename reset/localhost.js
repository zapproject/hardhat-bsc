// File System module
const fs = require('fs');

// Reads the content of hardhat.config.ts
fs.readFile('hardhat.config.ts', 'utf8',

    (err, res) => {

        // Changes the `defaultNetwork: "hardhat"` to `defaultNetwork: "localhost"`
        const localConfig = res.replace(`defaultNetwork: "hardhat"`, `defaultNetwork: "localhost"`);

        /*Updates hardhat.config.ts file to support the localhost network
          without manually changing */
        fs.writeFile('hardhat.config.ts', localConfig, (error) => {

            if (error) {

                return error;
            }

        })

    });

