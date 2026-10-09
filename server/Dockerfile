FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --omit=dev --workspace server
COPY server/src ./server/src
USER node
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "server"]
