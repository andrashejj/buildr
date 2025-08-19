# Base stage with Node.js and pnpm setup
FROM node:lts-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install required dependencies and global packages
RUN npm install -g pnpm && \
    npm install -g ts-node

WORKDIR /app/api

COPY . .

RUN pnpm i

EXPOSE 4000

CMD ["ts-node", "--transpile-only", "server.ts"]
