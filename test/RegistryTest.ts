import { ethers } from "hardhat";

import { solidity } from "ethereum-waffle";

import chai from "chai";

import { Database } from "../typechain/Database";

import { ZapCoordinator } from '../typechain/ZapCoordinator';

import { Registry } from '../typechain/Registry';

chai.use(solidity);

const { expect } = chai;

describe('Registry Test', () => {

    let database: Database;
    let coordinator: ZapCoordinator;
    let registry: Registry;
    let databaseFactory: any;
    let coordinatorFactory: any;
    let registryFactory: any;
    let signers: any;
    let providerTitle: any;
    let convertedEndpoint: any;
    let convertedParams: any;
    let parameters: any;

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

        signers = await ethers.getSigners();

        coordinatorFactory = await ethers.getContractFactory('ZapCoordinator', signers[0]);

        databaseFactory = await ethers.getContractFactory('Database', signers[0]);

        registryFactory = await ethers.getContractFactory('Registry', signers[0]);

        database = (await databaseFactory.deploy()) as Database;

        coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
        await coordinator.deployed();

        registry = (await registryFactory.deploy(coordinator.address)) as Registry;

        await database.transferOwnership(coordinator.address);
        await coordinator.addImmutableContract('DATABASE', database.address);
        await coordinator.updateContract('REGISTRY', registry.address);
        await coordinator.updateAllDependencies();

    });

    it('REGISTRY_1 - Should be able to create an instance of the ZapCoordinator contract', () => {

        expect(coordinatorFactory).to.be.ok;

    });

    it('REGISTRY_2 - Should be able to create an instance of the Registry contract', () => {

        expect(registryFactory).to.be.ok;

    });

    it('REGISTRY_3 - Should be able to deploy the ZapCoordinator contract', () => {

        expect(coordinator).to.be.ok;

    });

    it('REGISTRY_4 - Should be able to deploy the Registry contract', () => {

        expect(registry).to.be.ok;

    });

    it("REGISTRY_5 - initiateProvider() - Check that we can initiate provider", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

    });

    it("REGISTRY_6 - initiateProvider() - Check that we can't change provider info if it was initated",
        async () => {

            const newTestTitle = ethers.utils.formatBytes32String('newTestProvider');
            const newPublicKey = 789;

            providerTitle = ethers.utils.formatBytes32String(testProvider.title);

            expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

            try {

                expect(await registry.initiateProvider(newPublicKey, newTestTitle)).to.throw(

                    'Provider is already initiated'
                )

            } catch (err) {

                console.log('Provider is already initiated')
            }

        });

    it("REGISTRY_7 - initiateProviderCurve() - Check that we can initiate provider curve",
        async () => {

            providerTitle = ethers.utils.formatBytes32String(testProvider.title);
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

            expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

            expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
                testProvider.emptyBroker
            )).to.be.ok;

        });

    it("REGISTRY_8 - initiateProviderCurve() - Check that we can't initiate provider curve if provider wasn't initiated",
        async () => {

            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

            try {

                expect(await registry.initiateProviderCurve(
                    convertedEndpoint,
                    testProvider.curve,
                    testProvider.emptyBroker

                )).to.throw('Curve can not be initiated, The provider is not initiated')

            } catch (err) {

                console.log('Curve can not be initiated, The provider is not initiated');
            }

        });

    it("REGISTRY_9 - get/setEndpointParams() - Check that we can get and set provider endpoint parameters",
        async () => {

            providerTitle = ethers.utils.formatBytes32String(testProvider.title);
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);
            convertedParams = testProvider.endpointParams.map(param => ethers.utils.formatBytes32String(param));

            expect(await registry.initiateProvider(
                testProvider.publicKey,
                providerTitle,
            )).to.be.ok;

            expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
                testProvider.emptyBroker
            )).to.be.ok;


            expect(await registry.setEndpointParams(convertedEndpoint, convertedParams)).to.be.ok;

            const getParams = await registry.getEndpointParams(signers[0].address, convertedEndpoint);

            expect(getParams[0]).to.equal(convertedParams[0]);
            expect(getParams[1]).to.equal(convertedParams[1]);
        });

    it("REGISTRY_10 - get/setProviderParameter() - Check that we can get and set provider parameters",
        async () => {

            providerTitle = ethers.utils.formatBytes32String(testProvider.title);
            convertedParams = testProvider.endpointParams.map(param => ethers.utils.formatBytes32String(param));
            convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);
            parameters = [testProvider.markdownFile, testProvider.jsonFile];
            let bytesParameters = [];

            for (var i = 0; i < parameters.length; i++) {

                bytesParameters.push(ethers.utils.toUtf8Bytes(parameters[i]));
            }

            bytesParameters = bytesParameters.map(parameter => ethers.utils.hexlify(parameter));

            expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,
            )).to.be.ok;

            expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
                testProvider.emptyBroker
            )).to.be.ok;

            expect(await registry.setEndpointParams(convertedEndpoint, convertedParams
            )).to.be.ok;

            const getParams = await registry.getEndpointParams(signers[0].address, convertedEndpoint);

            expect(await registry.setProviderParameter(
                getParams[0],
                bytesParameters[0])).to.be.ok;

            expect(await registry.setProviderParameter(getParams[1], bytesParameters[1])).to.be.ok;

            expect(await registry.getProviderParameter(signers[0].address, getParams[0]))
                .to.equal(bytesParameters[0]);

            expect(await registry.getProviderParameter(signers[0].address, getParams[1]))
                .to.equal(bytesParameters[1]);

        });

    it("REGISTRY_11 - getProviderTitle() - Check that we can get provider title", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,
        )).to.be.ok;

        expect(await registry.getProviderTitle(signers[0].address)).to.equal(providerTitle);

    });

    it("REGISTRY_12 - getProviderTitle() - Check that title of uninitialized provider is empty", async () => {

        expect(await registry.getProviderTitle(signers[0].address))
            .to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    });

    it("REGISTRY_13 - getProviderPublicKey() - Check that we can get provider public key", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

        expect(await registry.getProviderPublicKey(signers[0].address)).to.equal(testProvider.publicKey);

    });

    it("REGISTRY_14 - getProviderPublicKey() - Check that public key of uninitialized provider is equal to 0",
        async () => {

            expect(await registry.getProviderPublicKey(signers[0].address)).to.equal(0);

        });

    it("REGISTRY_15 - getProviderCurve() - Check that we initialize and get provider curve", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

        expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve, testProvider.emptyBroker
        )).to.be.ok;

        const curve = [];
        let curveLength = 0;
        const getCurve = await registry.getProviderCurve(signers[0].address, convertedEndpoint);
        const getCurveLength = await registry.getProviderCurveLength(signers[0].address, convertedEndpoint);

        for (var i = 0; i < getCurve.length; i++) {

            curve.push(parseInt(getCurve[i]._hex));
        }

        curveLength = parseInt(getCurveLength._hex);

        expect(curve.length).to.equal(testProvider.curve.length);
        expect(curveLength).to.equal(testProvider.curve.length);
        expect(curve).to.eql(testProvider.curve);


    });

    it("REGISTRY_16 - getProviderCurve() - Check that cant get uninitialized curve ", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,
        )).to.be.ok;

        try {

            expect(await registry.getProviderCurve(signers[0].address, convertedEndpoint
            )).to.throw('Curve is not initialized')

        } catch (err) {

            console.log('Curve is not initialized');
        }

    });

    it("REGISTRY_17 - getAllOracles() - Check that we can get all providers", async function () {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle,)).to.be.ok;

        const providers = await registry.getAllOracles();

        expect(providers[0]).to.equal(signers[0].address);

    });

    it("REGISTRY_18 - getEndpointBroker() - Check that broker address can be saved and retreived", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle)).to.be.ok;

        expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve,
            testProvider.emptyBroker)).to.be.ok;

        const brokerAddress = await registry.getEndpointBroker(signers[0].address, convertedEndpoint);

        expect(brokerAddress).to.equal(testProvider.emptyBroker);
    });

    it("REGISTRY_19 - clearEndpoint() - Check that provider can clear endpoint with no bonds", async () => {

        providerTitle = ethers.utils.formatBytes32String(testProvider.title);
        convertedEndpoint = ethers.utils.formatBytes32String(testProvider.endpoint);

        expect(await registry.initiateProvider(testProvider.publicKey, providerTitle)).to.be.ok;

        expect(await registry.initiateProviderCurve(convertedEndpoint, testProvider.curve, testProvider.emptyBroker
        )).to.be.ok;

        const endpoint = await registry.getProviderEndpoints(signers[0].address);

        expect(await registry.clearEndpoint(endpoint[0])).to.be.ok;

        const clearEndpoint = await registry.getProviderEndpoints(signers[0].address);

        expect(clearEndpoint[0]).to.eql('0x0000000000000000000000000000000000000000000000000000000000000000');

    });

    it("REGISTRY_20 - setProviderTitle() - Check that provider can change their title", async () => {

        const newProviderTitle = ethers.utils.formatBytes32String('newTestProvider');

        expect(await registry.initiateProvider(testProvider.publicKey, newProviderTitle)).to.be.ok;

        expect(await registry.setProviderTitle(newProviderTitle)).to.be.ok;

        expect(await registry.getProviderTitle(signers[0].address)).to.equal(newProviderTitle);

    });

})