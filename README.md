# Overview

=> Extractor (by Telethon): crawl new Telegram message
=> send to rabbitmq
=> Nestjs receive queue msg
=> Nestjs do place order on Binance

> https://bitbucket.org/bitqtradebuddy/telegram-signal-extractor-py/src/master/

# Installation

## Update ENV

```
cp .env.example .env
```

## Run with docker:

Update docker file and run deploy file

```bash
cd deploy
cp docker-compose.yml.example docker-compose.yml
deploy.sh
```

## Running the app local

```bash
npm install
npm run generate

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
