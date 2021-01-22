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

    const testProvider = {
        publicKey: 123,
        title: 'testProvider',
        endpointParams: ['p1', 'p2'],
        endpoint: 'testEndpoint',
        query: 'btcPrice',
        curve: [4, 5, 6],
        broker: '0x0000000000000000000000000000000000000000'
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

    it('Should be able to create an instance of the ZapCoordinator contract', () => {

        expect(coordinatorFactory).to.be.ok;

    });

    it('Should be able to create an instance of the Registry contract', () => {

        expect(registryFactory).to.be.ok;

    });

    it('Should be able to deploy the ZapCoordinator contract', () => {

        expect(coordinator).to.be.ok;

    });

    it('Should be able to deploy the Registry contract', () => {

        expect(registry).to.be.ok;

    });

    it('Should initiate a provider', async () => {

        const convertedTitle = ethers.utils.formatBytes32String(testProvider.title);

        const tx = await registry.initiateProvider(
            testProvider.publicKey,
            convertedTitle
        )

       const isInit = await registry.isProviderInitiated(signers[0].address)

       console.log(isInit)

      
    });

})