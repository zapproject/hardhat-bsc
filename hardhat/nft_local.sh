npx hardhat node --hostname 0.0.0.0 &
sleep 10
npx hardhat run --network localhost scripts/deploy_nft_contracts.ts
while true; do sleep 1; done