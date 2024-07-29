# [@wikiukbot](https://t.me/wikiukbot) - A telegram bot to search the Ukrainian Wikipedia in inline mode

A very simple project was made in a hour just because I did not find something for it.

It is written in [Node.js](https://nodejs.org) (ESM, that is why .mjs file extension) using [grammY](https://grammy.dev) as a Telegram API client.

## Setup
Firstly, you need to register your bot on Telegram, using [@BotFather](https://t.me/BotFather)


> You also need a [Node.js](https://nodejs.org) [>=20.12.0 due to `process.loadEnvFile()`] runtime for JavaScript
>
>(It does not work with [Deno](https://deno.com) due to `process.loadEnvFile()` and I have no clue if it works with [Bun](https://bun.sh), so let me know if it does)

### 1. Setup the environment variables

See [.env.example](./.env.example/) file. You can either fill .env file or set the actual environment variables

### 2. Install dependencies

Using Node.js with npm: `npm i`

### 3. Run the bot

Using Node.js with npm: `npm run start`
