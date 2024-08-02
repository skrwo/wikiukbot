/**
 * @file This module is vercel serverless function.
 * @see https://grammy.dev/hosting/vercel
 * @see https://vercel.com/docs/functions/quickstart
 */
import { env } from "node:process"
import { webhookCallback } from "grammy"
import { bot } from "../bot.mjs"

const callback = webhookCallback(bot, "std/http", {
    secretToken: env.WEBHOOK_SECRET_TOKEN
})

/**
 * @param {Request} req 
 */
export async function POST(req) {
    try {
        return await callback(req)
    } catch (e) {
        // do not send 5xx responses
        console.error("[!] Failed to process webhook request:\n", e)
        return new Response("Failed to process webhook request", { status: 200 })
    }
}