FROM node:20-bookworm

WORKDIR /opt/render/project/src

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpcap-dev python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]