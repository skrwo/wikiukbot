/**
 * @file This file runs the bot
 */

import { env } from "node:process"
import { createServer } from "node:http"
import { webhookCallback } from "grammy"
import { bot } from "./bot.mjs"

const onStart = (me) => console.log(`Bot is up and running on @${me.username}`)

if (env.DROP_PENDING_UPDATES) {
    await bot.api.deleteWebhook({ drop_pending_updates: true })
}

if (!env.WEBHOOK_URL) bot.start({ onStart })
else {
    const callback = webhookCallback(bot, "http", {
        secretToken: env.WEBHOOK_SECRET_TOKEN,
    })
    const server = createServer(async (req, res) => {
        if (req.method === "POST") {
            try {
                return await callback(req, res)
            } catch (e) {
                console.error(e)
            }
        }
        return res.writeHead(200, "ok").end()
    })
    server.listen(
        parseInt(env.PORT || 8443),
        "0.0.0.0",
        async () => onStart(await bot.api.getMe()),
    )
    await bot.api.setWebhook(env.WEBHOOK_URL, {
        secret_token: env.WEBHOOK_SECRET_TOKEN,
    })
}
