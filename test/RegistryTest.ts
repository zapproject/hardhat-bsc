import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle";

import chai from "chai";

import { Database } from "../typechain/Database";

import { ZapCoordinator } from '../typechain/ZapCoordinator';

import { Registry } from '../typechain/Registry';

chai.use(solidity);

const { expect } = chai;

describe('Registry Test', () => {

    /**
     * @param database Stores the deployed Database
     * @param coordinator Stores the deployed Coordinator
     * @param registry Stores the deployed Registry
     * @param databaseFactory Stores the instance of the Database
     * @param coordinatorFactory Stores the instance of the Coordinator
     * @param registryFactory Stores the instance of the Registry
     * @param signers Contains the 20 test accounts provider by Hardhat
     * @param providerTitle Stores the testProvider.title converted as a bytes32 string
     * @param convertedEndpoint Stores the testProvider.endpoint converted as a bytes32 string
     * @param convertedParams Stores the test markdown and JSON params inside an array
     * @param parameters Stores the test markdown and JSON URL's inside an array
     */

    let database: Database;
    let coordinator: ZapCoordinator;
    let registry: Registry;
    let databaseFactory: any;
    let coordinatorFactory: any;
    let registryFactory: any;
    let signers: any;
    let providerTitle: string;
    let convertedEndpoint: string;
    let convertedParams: string[];
    let parameters: string[];

    /**
     * @param testProvider Stores the key/value pairs needed to create, read, and maintain a provider
     * @param publicKey Stores the test unique id to instantiate a provider
     * @param title Name of the test provider before bytes32 conversion
     * @param endpointParams Stores the test endpoint params before bytes32 conversion
     * @param markdownFile Stores the test curve markdown file before bytes32 conversion
     * @param jsonFile Stores the test curve JSON file before bytes32 conversion
     * @param endpoint Stores the test endpoint before bytes32 conversion
     * @param curve Stores the test coefficient array for the provider curve
     * @param emptyBroker Stores the test 0x0 broker address
     */

    const testProvider = {

        publicKey: 123,
        title: 'testProvider',
        endpointParams: ['p1.md', 'p2.json'],
        markdownFile: 'https://raw.githubusercontent.com/mxstbr/markdown-test-file/master/TEST.md',
        jsonFile: ' https://gateway.ipfs.io/ipfs/QmaWPP9HFvWZceV8en2kisWdwZtrTo8ZfamEzkTuFg3PFr',
        endpoint: 'testEndpoint',
        curve: [3, 0, 2, 1, 100],
        emptyBroker: '0x0000000000000000000000000000000000000000'

    };

    beforeEach(async () => {

        // Gets the 20 test accounts
        signers = await ethers.getSigners();

        // First signer instantiating the Coordinator, Database, and Registry contracts
        coordinatorFactory = await ethers.getContractFactory('ZapCoordinator', signers[0]);
        databaseFactory = await ethers.getContractFactory('Database', signers[0]);
        registryFactory = await ethers.getContractFactory('Registry', signers[0]);

        // Deploys the Database contract
        database = (await databaseFactory.deploy()) as Database;
        await database.deployed();

        // Deployes the Coordinator contract
        coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
        await coordinator.deployed();

        // Deploys the Registry Contract
        registry = (await registryFactory.deploy(coordinator.address)) as Registry;
        await registry.deployed();


        await database.transferOwnership(coordinator.address);

        await coordinator.addImmutableContract('DATABASE', database.address);

        await coordinator.updateContract('REGISTRY', registry.address);

        await coordinator.updateAllDependencies();

    });

    it('REGISTRY_1 - Should be able to create an instance of the ZapCoordinator contract', () => {

        // Expects coordinatorFactory to be fulfilled
        expect(coordinatorFactory).to.be.ok;

    });

    it('REGISTRY_2 - Should be able to create an instance of the Registry contract', () => {

        // Expects registryFactory to be fulfilled
        expect(registryFactory).to.be.ok;

    });

    it('REGISTRY_3 - Should be able to create an instance of the Database contract', () => {

        // Expects databaseFactory to be fulfilled
        expect(databaseFactory).to.be.ok;

    });


    it('REGISTRY_4 - Should be able to deploy the ZapCoordinator contract', () => {

        // Expects coordinator to be fulfilled
        expect(coordinator).to.be.ok;

    });

    it('REGISTRY_5 - Should be able to deploy the Registry contract', () => {

        // Expects registry to be fulfilled
        expect(registry).to.be.ok;

    });

    it('REGISTRY_6 - Should be able to deploy the Database contract', () => {

        // Expects database to be fulfilled
        expect(database).to.be.ok;

    });

    it("REGISTRY_7 - initiateProvider() - Check that we can initiate provider", async () => {

        // Converts testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Expect the initiateProvider function to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

    });

    it("REGISTRY_8 - initiateProvider() - Check that we can't change provider info if it was initated",
        async () => {

            // New provider title used to test against the provider already initiated
            const newTestTitle = ethers.utils.formatBytes32String('newTestProvider');

            // New public key used to test against the provider already initiated
            const newPublicKey = 789;

            // Converts testProvider.title to a bytes32 string
            providerTitle = ethers.utils.formatBytes32String(testProvider.title);

            // Expect the initiateProvider to be fulfilled
            expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

            try {

                // Expect trying to initiate a provider twice to throw an error
                expect(await registry.initiateProvider(newPublicKey, newTestTitle)).to.throw(

                    'Provider is already initiated'
                )

            } catch (err) {

                console.log('Provider is already initiated')
            }

        });

    it("REGISTRY_9 - initiateProviderCurve() - Check that we can initiate provider curve",
        async () => {

            // Converts testProvider.title to a bytes32 string
            providerTitle = ethers.utils.formatBytes32String(testProvider.title);

            // Converts testProvider.endpoint to a bytes32 string
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

            // Expect the intiateProvider to be fulfilled
            expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

            // Expect the initiateProviderCurve to be fulfilled
            expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
                testProvider.emptyBroker
            )).to.be.ok;

        });

    it("REGISTRY_10 - initiateProviderCurve() - Check that we can't initiate provider curve if provider wasn't initiated",
        async () => {

            // Converts testProvider.endpoint to a bytes32 string
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

            try {

                // Expect trying to initiate a curve without initiating the provider to throw an error
                expect(await registry.initiateProviderCurve(
                    convertedEndpoint,
                    testProvider.curve,
                    testProvider.emptyBroker

                )).to.throw('Curve can not be initiated, The provider is not initiated')

            } catch (err) {

                console.log('Curve can not be initiated, The provider is not initiated');
            }

        });

    it("REGISTRY_11 - get/setEndpointParams() - Check that we can get and set provider endpoint parameters",
        async () => {

            // Converts the testProvider.title to a bytes32 string
            providerTitle = ethers.utils.formatBytes32String(testProvider.title);

            // Converts testProvider.endpoint to a bytes32 string
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

            // Converts testProvider.endpointParams to an array of bytes32 strings
            convertedParams = testProvider.endpointParams.map(param => ethers.utils.formatBytes32String(param));

            // Expect initiateProvider to be fulfilled
            expect(await registry.initiateProvider(
                testProvider.publicKey,
                providerTitle,
            )).to.be.ok;

            // Expect initiateProviderCurve to be fulfilled
            expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
                testProvider.emptyBroker
            )).to.be.ok;

            // Expect setEndpointParams to be fulfilled
            expect(await registry.setEndpointParams(convertedEndpoint, convertedParams)).to.be.ok;

            // Stores the endpoint params from the provider
            const getParams = await registry.getEndpointParams(signers[0].address, convertedEndpoint);

            // Expect the first param(markdown param) returned to equal the first converted param
            expect(getParams[0]).to.equal(convertedParams[0]);

            // Expect the second param(JSON param) returned to equal the second converted param
            expect(getParams[1]).to.equal(convertedParams[1]);
        });

    it("REGISTRY_12 - get/setProviderParameter() - Check that we can get and set provider parameters",
        async () => {

            // Converts the provider title to a bytes32 string
            providerTitle = ethers.utils.formatBytes32String(testProvider.title);

            // Converts testProvider.endpointParams to an array of bytes32 strings
            convertedParams = testProvider.endpointParams.map(param => ethers.utils.formatBytes32String(param));

            // Converts testProvider.endpoint to a bytes32 string
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

            // Stores the markdown & JSON URL's in an array
            parameters = [testProvider.markdownFile, testProvider.jsonFile];

            // Will store the converted parameters
            let bytesParameters = [];

            for (var i = 0; i < parameters.length; i++) {

                // Storing each converted parameter
                bytesParameters.push(ethers.utils.toUtf8Bytes(parameters[i]));
            }

            // Convert to bytes
            bytesParameters = bytesParameters.map(parameter => ethers.utils.hexlify(parameter));

            // Expect initiateProvider to be fulfilled
            expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,
            )).to.be.ok;

            // Expect initiateProviderCurve to be fulfilled
            expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
                testProvider.emptyBroker
            )).to.be.ok;

            // Expect setEndpointParams to be fulfilled
            expect(await registry.setEndpointParams(convertedEndpoint, convertedParams
            )).to.be.ok;

            // Stores the endpoint params from the provider
            const getParams = await registry.getEndpointParams(signers[0].address, convertedEndpoint);

            // Expect the setProviderParameter on the markdown link to be fulfilled
            expect(await registry.setProviderParameter(getParams[0], bytesParameters[0])).to.be.ok;

            // Expect the setProviderParameter on the JSON link to be fulfilled
            expect(await registry.setProviderParameter(getParams[1], bytesParameters[1])).to.be.ok;

            // Expect getProviderParameter on the markdown link to be fulfilled
            expect(await registry.getProviderParameter(signers[0].address, getParams[0]))
                .to.equal(bytesParameters[0]);

            // Expect the getProviderParameter on the JSON link to be fulfilled
            expect(await registry.getProviderParameter(signers[0].address, getParams[1]))
                .to.equal(bytesParameters[1]);

        });

    it("REGISTRY_13 - getProviderTitle() - Check that we can get provider title", async () => {

        // Converts testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Expects initiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,
        )).to.be.ok;

        // Expects getProviderTitle to be fulfilled
        expect(await registry.getProviderTitle(signers[0].address)).to.equal(providerTitle);

    });


    it("REGISTRY_14 - getProviderTitle() - Check that title of uninitialized provider is empty", async () => {

        // Expect getProviderTitle to be fulfilled
        expect(await registry.getProviderTitle(signers[0].address))
            .to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    });

    it("REGISTRY_15 - getProviderPublicKey() - Check that we can get provider public key", async () => {

        // Converts testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Expect initiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

        // Expect getProviderPublicKey to be returned
        expect(await registry.getProviderPublicKey(signers[0].address)).to.equal(testProvider.publicKey);

    });

    it("REGISTRY_16 - getProviderPublicKey() - Check that public key of uninitialized provider is equal to 0",
        async () => {

            // Expects to fulfill without being initialized
            expect(await registry.getProviderPublicKey(signers[0].address)).to.equal(0);

        });

    it("REGISTRY_17 - getProviderCurve() - Check that we initialize and get provider curve", async () => {

        // Converts testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Converts testProvider.endpoint to a bytes32 string
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        // Expect intiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

        // Expect initiateProviderCurve to be fulfilled
        expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve, testProvider.emptyBroker
        )).to.be.ok;

        // Will store the test endpoints curve
        const curve = [];

        // Set curveLength to 0 for now
        let curveLength = 0;

        // Returns the curve from the providers test endpoint as a hexstring
        const getCurve = await registry.getProviderCurve(signers[0].address, convertedEndpoint);

        // Returns the curve length from the providers test endpoint 
        const getCurveLength = await registry.getProviderCurveLength(signers[0].address, convertedEndpoint);

        for (var i = 0; i < getCurve.length; i++) {

            // Converts each array element from a hexstring to a readable integer
            curve.push(parseInt(getCurve[i]._hex));
        }

        // Parses getCurveLength to a readable integer and sets the value for curve length
        curveLength = parseInt(getCurveLength._hex);

        // Expect the manual curve length to equal the manual test provider curve length
        expect(curve.length).to.equal(testProvider.curve.length);

        // Expect the returned getProviderCurveLength to equal the manual test provider curve length
        expect(curveLength).to.equal(testProvider.curve.length);

        // Expect the curve to equal thte test provider curve
        expect(curve).to.eql(testProvider.curve);

    });

    it("REGISTRY_18 - getProviderCurve() - Check that cant get uninitialized curve ", async () => {

        // Converts the testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Converts testProvider.endpoint to a bytes32 string
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        // Expect intitiate Provider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,
        )).to.be.ok;

        try {

            // Expect trying to get a provider curve that wasnt initialized to throw an error
            expect(await registry.getProviderCurve(signers[0].address, convertedEndpoint
            )).to.throw('Curve is not initialized')

        } catch (err) {

            console.log('Curve is not initialized');
        }

    });

    it("REGISTRY_19 - getAllOracles() - Check that we can get all providers", async function () {

        // Converts the testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Expect intiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

        // Stores the initiated providers returned
        const providers = await registry.getAllOracles();

        // Expect the returned provider to be the same
        expect(providers[0]).to.equal(signers[0].address);

    });

    it("REGISTRY_20 - getEndpointBroker() - Check that broker address can be saved and retreived", async () => {

        // Converts the testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Converts the testProvider.endpoint to a bytes32 string
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        // Expects the initiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle)).to.be.ok;

        // Expects the initiateProviderCurve to be fulfilled
        expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
            testProvider.emptyBroker)).to.be.ok;

        // Stores the broker address returned
        const brokerAddress = await registry.getEndpointBroker(signers[0].address, convertedEndpoint);

        // Expects getEndpointBroker to equal testProvider.emptyBroker
        expect(brokerAddress).to.equal(testProvider.emptyBroker);
    });

    it("REGISTRY_21 - clearEndpoint() - Check that provider can clear endpoint with no bonds", async () => {

        // Converts testProvider.title to a bytes32 string
        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        // Converts testProvider.endpoint to a bytes32 string
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        // Expect initiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle)).to.be.ok;

        // Expect initiateProviderCurve to be fulfilled
        expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve, testProvider.emptyBroker
        )).to.be.ok;

        // Returns the endpoints of the provider
        const endpoint = await registry.getProviderEndpoints(signers[0].address);

        // Expect clearEndpoint to be fulfilled
        expect(await registry.clearEndpoint(endpoint[0])).to.be.ok;

        const clearEndpoint = await registry.getProviderEndpoints(signers[0].address);

        // Expect the cleared endpoint to be 0x0
        expect(clearEndpoint[0]).to.eql('0x0000000000000000000000000000000000000000000000000000000000000000');

    });

    it("REGISTRY_22 - setProviderTitle() - Check that provider can change their title", async () => {

        // New provider title 
        const newProviderTitle = ethers.utils.formatBytes32String('newTestProvider');

        // Expects initiateProvider to be fulfilled
        expect(await registry.initiateProvider(testProvider.publicKey, newProviderTitle)).to.be.ok;

        // Expects setProviderTitle to be fulfilled
        expect(await registry.setProviderTitle(newProviderTitle)).to.be.ok;

        // Expects the returned provider title be equal newProviderTitle
        expect(await registry.getProviderTitle(signers[0].address)).to.equal(newProviderTitle);

    });

})