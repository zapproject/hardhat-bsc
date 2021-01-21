import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";

import { ZapCoordinator } from '../typechain/ZapCoordinator';

import { Registry } from '../typechain/Registry';


describe('Registry Test', () => {
    let coordinator: ZapCoordinator;
    let registry: Registry;

    let signers: any;

    beforeEach(async () => {
        
        signers = await ethers.getSigners();

        const coordinatorFactory = await ethers.getContractFactory('ZapCoordinator', signers[0]);

        const registryFactory = await ethers.getContractFactory('Registry', signers[0]);

        coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
        await coordinator.deployed();

        registry = (await registryFactory.deploy(coordinator.address)) as Registry;
        await registry.deployed();
    });

    it('Test contracts', () => {

        console.log({
            registry: registry,
            coordinator: coordinator
        })
    })

})