FROM node:20-alpine3.18

# Create directory of the program
WORKDIR /anticheat

# Copy in needed stuff
COPY /package.json .
RUN mkdir local
COPY /local/package.json ./local
COPY /local/src ./local
COPY /local/tsconfig.json ./local

# Install dependencies and build
RUN npm run update-local
RUN npm run build-local

# Set up env files at the end so you can change these without having to recompile
ENV LOG_PATH=/log/console.log
ENV RCON_HOST=host.docker.internal
ENV RCON_PWD=tf2bk

# Finally, run command
CMD [ "node", "local/build/index.js" ]
