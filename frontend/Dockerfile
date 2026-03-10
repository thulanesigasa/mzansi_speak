FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

# Create non-root user and group
RUN addgroup -S mzansigroup && adduser -S mzansiuser -G mzansigroup
RUN chown -R mzansiuser:mzansigroup /app

USER mzansiuser

EXPOSE 3000

CMD ["npm", "start"]
