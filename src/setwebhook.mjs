import { GrammyError } from "grammy"
import { bot } from "./bot.mjs"
import { env } from "node:process"

const webhookUrl = env.WEBHOOK_URL ?? (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}/api/webhook` : undefined)

if (!webhookUrl) throw new Error("Missing environment variable: `WEBHOOK_URL`")

/**
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// i have no clue why vercel runs it twice but telegram doesnt like it
// so we must respect ratelimits
async function setWebhook() {
    try {
        return await bot.api.setWebhook(webhookUrl, {
            secret_token: env.WEBHOOK_SECRET_TOKEN,
            drop_pending_updates: !!env.DROP_PENDING_UPDATES,
        })
    } catch (e) {
        if (e instanceof GrammyError && e.parameters.retry_after) {
            await sleep(e.parameters.retry_after * 1000)
            return await setWebhook()
        }
        throw e
    }
}

console.log("[I] Setting webhook...")

await setWebhook()

console.log("[I] Webhook was set to", webhookUrl)