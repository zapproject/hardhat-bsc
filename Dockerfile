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

# PM2 Connection
RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY wufv4yr66nw0ge6
ENV PM2_SECRET_KEY 9pp4g5egqscuoxf

CMD ["chmod", "+x", "./start.sh"]

CMD ["pm2-runtime", "./start.sh"]



#RUN npx hardhat node &
# CMD ["./start.sh"]


# CI Rules
