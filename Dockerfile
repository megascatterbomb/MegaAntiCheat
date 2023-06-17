FROM node:20-alpine3.18
WORKDIR /local
# Copy in needed stuff
COPY /local/package.json .
COPY /local/src .
COPY /local/tsconfig.json .

# Install dependencies
RUN npm install
RUN npm install --global typescript

# Transpile to js
RUN tsc -p ./tsconfig.json 

# Set up env files at the end so you can change these without having to recompile
ENV LOG_PATH=/log
ENV RCON_PWD=tf2bk
ENV DOCKER=true

# Finally, run command
CMD [ "node", "build/index.js" ]