import { bot } from "./bot.mjs"
import { env } from "node:process"

const webhookUrl = env.WEBHOOK_URL ?? (env.VERCEL_URL ? `https://${env.VERCEL_URL}/api/webhook` : undefined)

if (!webhookUrl) throw new Error("Missing environment variable: `WEBHOOK_URL`")

await bot.api.setWebhook(webhookUrl, {
    secret_token: env.WEBHOOK_SECRET_TOKEN,
    drop_pending_updates: !!env.DROP_PENDING_UPDATES,
})

console.log("[I] Webhook was set to", webhookUrl)