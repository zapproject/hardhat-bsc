FROM keymetrics/pm2:12-alpine

COPY . .

# Install app dependencies
#COPY package.json /
COPY ./package*.json ./

COPY package-lock.json /
EXPOSE 8545
EXPOSE 80


# Bundle app source
RUN npm install 
RUN npm install pm2 -g


COPY ./tasks/. .
COPY ./test/. .
COPY ./scripts/. .
COPY ./contracts/. . 
COPY ecosystem.config.js .


RUN npm run build
# RUN npm audit --fix


ENV PM2_PUBLIC_KEY bdh9q68spo1eiqn
ENV PM2_SECRET_KEY qs29ye4cnzybyl4


CMD ["chmod", "+x", "./start.sh"]

#RUN npx hardhat node &
# CMD ["./start.sh"]
# CMD ["npm", "run", "pm2"]


CMD ["pm2-runtime", "start", "ecosystem.config.js"]
# CMD ["pm2-runtime", "ecosystem.config.js"]

# CI Rules
