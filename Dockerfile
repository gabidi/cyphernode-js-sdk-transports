FROM node:12
COPY . /usr/app
WORKDIR /usr/app
RUN npm i --production
EXPOSE 5000:5000
