FROM node:alpine 
# RUN useradd -u 8877 prod
# Change to non-root privilege
# USER prod
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add --update alpine-sdk
# Install app dependencies
#COPY package.json /
COPY ./package*.json ./

COPY package-lock.json /
EXPOSE 8545
EXPOSE 80

COPY . .

# Bundle app source
RUN npm install 
RUN npm run build

CMD ["chmod", "+x", "./start.sh"]

CMD [".start.sh"]
