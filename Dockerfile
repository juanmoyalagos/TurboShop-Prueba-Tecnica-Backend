FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock* ./
COPY .yarnrc.yml ./
COPY .yarn/ .yarn/

RUN corepack enable && yarn install --immutable

COPY . .

RUN yarn build

EXPOSE 8080

CMD ["sh", "-c", "yarn sequelize-cli db:migrate && node dist/index.js"]

