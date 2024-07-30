import { bot } from "./bot.mjs"
import { env } from "node:process"

if (!env.WEBHOOK_URL) throw new Error("Missing environment variable: `WEBHOOK_URL`")

await bot.api.setWebhook(env.WEBHOOK_URL, {
    secret_token: env.WEBHOOK_SECRET_TOKEN,
    drop_pending_updates: !!env.DROP_PENDING_UPDATES,
})

console.log("[I] Webhook was set to", env.WEBHOOK_URL)