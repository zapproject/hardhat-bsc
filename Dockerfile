FROM node:alpine 


ARG pm2_public
ARG pm2_secret
# Install app dependencies
#COPY package.json /
COPY ./package*.json ./

COPY package-lock.json /
EXPOSE 8545
EXPOSE 80

COPY . .
# COPY ./tasks/. .
# COPY ./test/. .
# COPY ./scripts/. .
# COPY ./contracts/. . 

# config file for pm2
COPY ./ecosystem.config.js .

# Bundle app source
RUN npm install 
RUN npm run build

# npm audit fix errors out when it checks the hardhat-v2.0.7.tar file
# RUN npm audit fix 


# install pm2 globall
RUN npm install pm2 -g

# pubic/secret key for pm2 monitoring: will change to zap-admin's credentials once done. (within .env or similar)
# ENV PM2_PUBLIC_KEY bdh9q68spo1eiqn
# ENV PM2_SECRET_KEY qs29ye4cnzybyl4
ENV PM2_PUBLIC_KEY $pm2_public
ENV PM2_SECRET_KEY $pm2_secret

CMD ["chmod", "+x", "./start.sh"]

#RUN npx hardhat node &
# CMD ["./start.sh"]

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
# CMD ./start.sh

