# Binance trading from signal + quick trade on new pair listing

# TradeFromSignal:Overview
=> Extractor (by Telethon): crawl new Telegram message
=> send to rabbitmq
=> Nestjs receive queue msg
=> Nestjs do place order on Binance

# TradeOnNewPairListing:Overview
=> configured the pair on in memory, don't need DB
=> NestJs listen for new pair listing via websocket api
=> Send event via event emitter (don't need a queue)
=> Nestjs receive event msg
=> Nestjs do place order on Binance
=> open some orders asap at the market price
=> Set TP at the 2x of buy price
=> Ignore and handle SL manually

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

## Binance useful docs
- Classical trade UI: https://www.binance.com/en/trade/DOGE_USDT
- Spot wallet: https://www.binance.com/en/my/wallet/account/main
- https://www.binance.com/en/trade-rule
- API docs: https://binance-docs.github.io/apidocs/spot/en/#check-server-time
- API error refs: https://binance-docs.github.io/apidocs/spot/en/#11xx-2xxx-request-issues

