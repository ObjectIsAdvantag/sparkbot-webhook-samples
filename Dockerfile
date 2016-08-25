# Start from argon (latest long term supported version of node)
# - argon : Full node dev env (640 MB) : python inside
# - argon-slim : Light node env (200 MB) : no python, can be an issue for npm installs / builds
FROM node:argon-slim

MAINTAINER Stève Sfartz

# create "node" user
RUN useradd -c 'Node.js user' -m -d /home/node -s /bin/bash node

# distribute application
RUN mkdir -p /home/node/samples
COPY . /home/node/samples

# build application
WORKDIR /home/node/samples
RUN npm install

# Switch to user mode
RUN chown -R node:node /home/node/samples
USER node
ENV HOME /home/node

# Run sample as default
EXPOSE 8080

CMD ["node", "minimalist.js"]