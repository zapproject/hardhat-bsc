npx hardhat node &
sleep 10
npx hardhat run --network localhost scripts/deploy.ts
while true; do  sleep 1; done