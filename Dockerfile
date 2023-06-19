FROM node:20-alpine3.18 AS dependencies

# Create directory of the program
WORKDIR /anticheat

# Copy in needed stuff
COPY /local/package.json . 
COPY /local/package-lock.json .
RUN npm ci

# Create second stage and set work directory again
FROM node:20-alpine3.18 AS builder
WORKDIR /anticheat

# Copy from dependencies, get source code and config, then build
COPY --from=dependencies /anticheat .
COPY /local/src .
COPY /local/tsconfig.json .
RUN npm run build

# Set up env files at the end so you can change these without having to recompile
ENV LOG_PATH=/log/console.log
ENV RCON_HOST=host.docker.internal
ENV RCON_PWD=tf2bk

# Finally, run command
CMD [ "node", "build/index.js" ]
