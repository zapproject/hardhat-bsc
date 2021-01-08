<<<<<<< HEAD
FROM node:alpine 


# Install app dependencies
#COPY package.json /
COPY ./package*.json ./

COPY package-lock.json /
EXPOSE 8545
EXPOSE 80

# Bundle app source
RUN npm install 
RUN npm build
RUN npm audit --fix

COPY . .
COPY ./tasks/. .
COPY ./test/. .
COPY ./scripts/. .
COPY ./contracts/. . 
#RUN npx hardhat node &
CMD ["npx", "hardhat", "node"]
