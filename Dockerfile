# Start from argon (latest long term supported version of node)
# - argon : Full node dev env (640 MB) : python inside
# - argon-slim : Light node env (200 MB) : no python, can be an issue for npm installs / builds
FROM node:argon-slim

MAINTAINER Stève Sfartz

EXPOSE 8080

# create 'not priviledged' user
RUN useradd -c 'Node.js user' -m -d /home/node -s /bin/bash node

# isolate code distribution
RUN mkdir -p /home/node/samples
WORKDIR /home/node/samples

# build application 
# [TIP] minimize image rebuilds needs by isolating dependencies from declarative aspects  
COPY package-docker.json /home/node/samples/package.json
RUN npm install

# check the .dockerignore file 
COPY . /home/node/samples

# Switch to user mode
RUN chown -R node:node /home/node/samples
USER node
ENV HOME /home/node

# Run default sample
CMD ["node", "minimalist.js"]