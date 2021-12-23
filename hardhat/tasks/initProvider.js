const { task, taskArgs } = require("hardhat/config");

require("hardhat-deploy-ethers");
require("hardhat-deploy");

task("initiateProvider", "Initializes the first 20 accounts as a Provider")

    .setAction(async () => {

        // Storage for the provider titles returned from getProviderTitles()
        const providerTitles = [];

        // Storage for the provider public keys returned from getProviderPublicKey()
        const providerPublicKeys = [];

        // Storage for the provider initiated status returned from isProviderInitiated()
        const providerStatus = [];

        // Test accounts
        const signers = await ethers.getSigners();

        // Connection to Registry.sol
        const Registry = await ethers.getContractFactory('Registry');
        const registry = await Registry.attach('0xa513E6E4b8f2a923D98304ec87F64353C4D5C853');

        // Stores the titles of all 20 providers
        let title = [
            "Slothrop",
            "Blicero",
            "Borgesius",
            "Enzian",
            "Pointsman",
            "Tchitcherine",
            "Achtfaden",
            "Andreas",
            "Bianca",
            "Bland",
            "Bloat",
            "Bodine",
            "Bounce",
            "Bummer",
            "Byron the Bulb",
            "Chiclitz",
            "Christian",
            "Darlene",
            "Dodson-Truck",
            "Erdmann"
        ];

        // Public keys to assign the test providers
        const publicKeys = [
            100,
            101,
            102,
            103,
            104,
            105,
            106,
            107,
            108,
            109,
            110,
            111,
            112,
            113,
            114,
            115,
            116,
            117,
            118,
            119,
            120
        ];

        // Converts the title array to an array of bytes32 strings
        title = title.map(name => ethers.utils.formatBytes32String(name));

        for (var i = 0; i < signers.length; i++) {

            try {

                // Connects the 20 test accounts to Registry.sol as signers
                // Initiates the 20 test accounts as providers
                await registry.connect(signers[i]).initiateProvider(publicKeys[i], title[i]);

            } catch (err) {

                console.log(signers[i].address + ': Provider is already initiated');

            }

            // Stores each initiated provider title as a bytes32 string
            providerTitles.push(await registry.connect(signers[i]).getProviderTitle(signers[i].address));

            // Stores each provider public key as a hexString
            providerPublicKeys.push(await registry.connect(signers[i]).getProviderPublicKey(signers[i].address));

            // Stores each provider initiated status as a boolean
            providerStatus.push(await registry.connect(signers[i]).isProviderInitiated(signers[i].address));

            console.log({
                title: ethers.utils.parseBytes32String(providerTitles[i]),
                //bytes32Title: providerTitles[i],
                address: signers[i].address,
                publicKey: parseInt(providerPublicKeys[i]._hex),
                // hexPublicKey: providerPublicKeys[i]._hex,
                status: providerStatus[i]
            });

        }

    })