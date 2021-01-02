
const { task, taskArgs } = require("hardhat/config");
require("hardhat-deploy-ethers");
require('hardhat-deploy');
const publicKey = 111;
const title = "test";
const routeKeys = [1];
const params = ["param1", "param2"];

const specifier = "test-specifier";
const zeroAddress = Utils.ZeroAddress;

const piecewiseFunction = [3, 0, 0, 2, 10000];
const broker = 0;
let oracles=[
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
            {publicKey:111,title:"",piecewiseFunction:[3, 0, 0, 2, 10000]},
        ]


task("oraclee initializer", "creates provider accounts, providers and oracles")

    .setAction(async () => {
        let addresses={coordinator:"",database:"",bondage:"",dispatch:"",registry:"",arbiter:""}
        // Stores the ZAP balance of each test account
        const balances = [];

        // Test accounts
        const signers = await ethers.getSigners();

            
   
        const Coordinator = await ethers.getContractFactory('ZapCoordinator');      
        const coordinator = await Coordinator.attach(addresses.coordinator);
        const Database = await ethers.getContractFactory('Database');     
        const database = await Database.attach(addresses.database);
        const Arbiter = await ethers.getContractFactory('Arbiter');
        const arbiter = await Arbiter.attach(addresses.arbiter);
        const Bondage = await ethers.getContractFactory('Bondage');        
        const bondage = await Bondage.attach(addresses.bondage);
        const Dispatch = await ethers.getContractFactory('Dispatch');        
        const dispatch = await  Dispatch.attach(addresses.dispatch);;
        const Registry = await ethers.getContractFactory('Registry')
        const registry = await  Registry.attach(addresses.registry);;
       

    
    });

