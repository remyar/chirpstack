FROM node:18

ENV DEBIAN_FRONTEND noninteractive

COPY app /app/

RUN cd /app/ && \
    npm config set strict-ssl=false  && \
    npm install --unsafe-perm

WORKDIR /app/

CMD ["npm", "start"]