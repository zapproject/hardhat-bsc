// File System module
const fs = require('fs')

// Reads the content of hardhat.config.ts
fs.readFile('hardhat.config.ts', 'utf8',

    (err, res) => {

        // Changes the `defaultNetwork: "localhost"` to `defaultNetwork: "localhost"`
        const hardhatConfig = res.replace(`defaultNetwork: "localhost"`, `defaultNetwork: "hardhat"`);

        /*Updates hardhat.config.ts file to support the hardhat network
          without directly changing the file */
        fs.writeFile('hardhat.config.ts', hardhatConfig, (error) => {

            if (error) {

                return error;
            }

        })

    });

