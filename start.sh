npx hardhat node --hostname 0.0.0.0 &
cat -n /etc/lsb-release
sleep 10
npx hardhat run --network localhost scripts/deploy.ts
