# The source code

This is where the actual source code of [@wikiukbot](https://t.me/wikiukbot) stored.

## File structure

|Path|Description|
|----|-----------|
|[index.mjs](./index.mjs)|Runs the bot using webhook or long polling (based on environment variables)|
|[bot.mjs](./bot.mjs)|Defines the bot's logic|
|[wiki.mjs](./wiki.mjs)|Interacts with Wikipedia API|
|[setwebhook.mjs](./setwebhook.mjs)|Helper script for Vercel Serverless Functions (if you use them)|
|[/api/webhook.mjs](./api/webhook.mjs)|The Vercel Serverless Function|