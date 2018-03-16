FROM node:8

ENV APPDIR /usr/local/app

WORKDIR $APPDIR

COPY package*.json ./

RUN npm install  && npm install -g gatsby-cli

COPY . .

EXPOSE 800

VOLUME ["$APPDIR/blogs"]
VOLUME ["$APPDIR/public"]

ENTRYPOINT ["gatsby"]
