npx hardhat node --hostname 0.0.0.0 &
cat -n /etc/lsb-release
echo $MODE
echo $NODE_URL
sleep 10
npx hardhat run --network localhost scripts/deploy.ts
while true; do sleep 1; done

