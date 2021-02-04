FROM node:alpine 

# Install app dependencies
#COPY package.json /
COPY ./package*.json ./

COPY package-lock.json /
EXPOSE 8545
EXPOSE 80

COPY . .
COPY ./tasks/. .
COPY ./test/. .
COPY ./scripts/. .
COPY ./contracts/. . 

# Bundle app source
RUN npm install 
RUN npm build
RUN npm audit --fix

CMD ["chmod", "+x", "./start.sh"]

#RUN npx hardhat node &
CMD ["./start.sh"]

# CI Rules
