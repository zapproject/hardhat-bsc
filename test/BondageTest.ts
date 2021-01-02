import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import mocha from "mocha";

import { ZapCoordinator } from "../typechain/ZapCoordinator";
import { Database } from "../typechain/Database";
import { Registry } from "../typechain/Registry";
import {Bondage} from  "../typechain/Bondage"
import { ZapToken } from '../typechain/ZapToken';
import {CurrentCost} from '../typechain/CurrentCost';
chai.use(solidity);
const { expect} = chai;

const publicKey = 77
const title = '0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce532';
const routeKeys = [1];
const params = ["param1", "param2"];

const specifier = "0x048a2991c2676296b330734992245f5ba6b98174d3f1907d795b7639e92ce577";
const zeroAddress =  '0x0000000000000000000000000000000000000000'

const piecewiseFunction = [3, 0, 0, 2, 10000];

const tokensForOwner =ethers.BigNumber.from("1500000000000000000000000000000");

const tokensForSubscriber = ethers.BigNumber.from("50000000000000000000000000000");

const approveTokens = ethers.BigNumber.from("1000000000000000000000000000000");

const dotBound = ethers.BigNumber.from("999");

describe("ZapBondage", () => {
    let zapToken: ZapToken;
    let dataBase:Database;
    let bondage:Bondage;
    let cost:CurrentCost
    let registry:Registry;
    let allocatedAmt: number;
    let signers: any;
    let coordinator: ZapCoordinator;
    let owner:any;
    let subscriber:any;
    let oracle:any;
    let broker:any;
   
    before(async()=>{
        signers = await ethers.getSigners();
        owner=signers[0]
        subscriber=signers[1];
        oracle=signers[2];
        broker=signers[3];
      
       
        const zapTokenFactory = await ethers.getContractFactory('ZapToken', signers[0]);                 
       
        const coordinatorFactory = await ethers.getContractFactory(
            "ZapCoordinator",
            signers[0]
          );        
    
          const dbFactory = await ethers.getContractFactory(
            "Database",
            signers[0]
          );
          
          const registryFactory = await ethers.getContractFactory(
            "Registry",
            signers[0]
          );
          const costFactory= await ethers.getContractFactory(
            "CurrentCost",
            signers[0]
          );
          const bondFactory = await ethers.getContractFactory('Bondage', signers[0]); 

          zapToken = (await zapTokenFactory.deploy()) as ZapToken;
         
          await zapToken.deployed();

          coordinator = (await coordinatorFactory.deploy()) as ZapCoordinator;
          await coordinator.deployed();

          dataBase = (await dbFactory.deploy()) as Database;

          cost= (await costFactory.deploy(coordinator.address)) as CurrentCost;

          registry = (await registryFactory.deploy(coordinator.address)) as Registry;

          await dataBase.transferOwnership(coordinator.address);
          console.log("adding ImmutableContracts")
          await coordinator.addImmutableContract('DATABASE', dataBase.address);               
         
         
          await coordinator.addImmutableContract('ZAP_TOKEN', zapToken.address);
          console.log("updating Contracts")
          await coordinator.updateContract('REGISTRY', registry.address);
          await coordinator.updateContract('CURRENT_COST', cost.address);
          console.log("deploying bond")
         
          bondage = (await bondFactory.deploy(coordinator.address)) as Bondage;
          console.log("deployed")
          console.log(bondage.address)
          console.log("updating bondage")
          await coordinator.updateContract('BONDAGE', bondage.address)
         console.log("transferring ownershipt")
         
         await coordinator.updateAllDependencies();
       
    })
     
    async function prepareProvider(provider = true, curve = true, account = oracle, curveParams = piecewiseFunction, bondBroker = broker) {
        console.log("init provider")
       
        await registry.connect(account).initiateProvider(publicKey, title);
        console.log("init curve")
       
        
       await registry.connect(account).initiateProviderCurve(specifier, curveParams, zeroAddress);
    }

    async function prepareTokens(allocAddress = subscriber) {
        console.log("allocate")
        await zapToken.allocate(owner.address, tokensForOwner)
        console.log("allocate")
        await zapToken.allocate(allocAddress.address, tokensForSubscriber)
        console.log("approve")
        await zapToken.connect(allocAddress).approve(bondage.address, approveTokens)
        
    }

    it("BONDAGE_1 - bond() - Check bond function", async function () {
      
        await prepareProvider()
        await prepareTokens()
        await prepareTokens(broker)
        console.log(oracle.address)
        await bondage.connect(subscriber).bond(oracle.address, specifier, dotBound);
        let result=await bondage.getBoundDots(subscriber.address, oracle.address, specifier)
        console.log(result.toString())
    });

})