import { env, loadEnvFile } from "node:process"
import { access } from "node:fs/promises"
import { createServer } from "node:http"
import { Bot, webhookCallback, InlineQueryResultBuilder } from "grammy"
import { search, WikiError } from "./wiki.mjs"

try {
    await access(".env")
    loadEnvFile()
} catch {
    console.log("no .env file found")
}

if (!env.TELEGRAM_TOKEN) throw new Error("Missing environment variable: `TELEGRAM_TOKEN`")

const bot = new Bot(env.TELEGRAM_TOKEN)

// Use error boundary instead of bot.catch so it will work for both polling and webhook
const composer = bot.errorBoundary(async (err) => {
    const e = err.error
    const query = err.ctx?.inlineQuery?.query
    if (e instanceof WikiError) console.error(`[!] WikiError detected on query='${query}':\n`, e)
    else console.error(`Strange error detected on query='${query}':\n`, e)
})

composer.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery.query
    if (!query) return await ctx.answerInlineQuery([], {
        button: { text: "Введіть пошуковий запит!", start_parameter: "help" }
    })

    const results = await search(query)

    const answer = results.map((r) =>
        InlineQueryResultBuilder.article(r.pageid, r.title, {
            description: r.description,
            thumbnail_url: r.thumbnail?.source,
            thumbnail_width: r.thumbnail?.width,
            thumbnail_height: r.thumbnail?.height,
        }).text(new URL(r.title, "https://uk.wikipedia.org/wiki/").toString())
    )

    await ctx.answerInlineQuery(answer, { cache_time: 60, button: undefined })
})

composer.command("start", async (ctx) => 
    ctx.reply(`🔍 Хочете <b>швидко</b> надіслати співрозмовнику сторінку з <a href="https://uk.wikipedia.org/">Вікіпедії</a>?

💕 Для цього не потрібно виходити з Telegram! Просто введіть у поле повідомлення:
<blockquote><code>@${ctx.me.username} Ан-225 Мрія</code></blockquote>
для пошуку сторінки про «Мрію»! Спробуйте, це зручно!

📁 Переглянути початковий код бота: github.com/skrw/wikiukbot`,
    {
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        reply_markup: {
            inline_keyboard: [ [ {
                text: "Спробувати",
                switch_inline_query: "Ан-225 Мрія"
            } ] ]
        },
    })
)

composer.command("privacy",
    ctx => ctx.reply(
        `Цей бот не збирає жодної інформації.
Ваші запити хіба що можуть записуватися до журналів помилок, якщо вони виникатимуть`
    )
)

const onStart = (me) => console.log(`Bot is up and running on @${me.username}`)

if (env.DROP_PENDING_UPDATES) {
    await bot.api.deleteWebhook({ drop_pending_updates: true })
}

if (!env.WEBHOOK_URL) bot.start({ onStart })
else {
    const callback = webhookCallback(bot, "http", {
        secretToken: env.WEBHOOK_SECRET_TOKEN
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
    server.listen(parseInt(env.PORT || 8443), "0.0.0.0", async () => 
        onStart(await bot.api.getMe())
    )
    await bot.api.setWebhook(env.WEBHOOK_URL, {
        secret_token: env.WEBHOOK_SECRET_TOKEN,
    })
}
