import { env, loadEnvFile } from "node:process"
import { Bot, InlineQueryResultBuilder } from "grammy"
import { getRandomArticleUrl, search, WikiError } from "./wiki.mjs"

try {
    loadEnvFile()
} catch (e) {
    if (e.code === "ENOENT") console.log("no .env file found")
    else throw e
}

if (!env.TELEGRAM_TOKEN) throw new Error("Missing environment variable: `TELEGRAM_TOKEN`")

export const bot = new Bot(env.TELEGRAM_TOKEN, {
    client: {
        // Allow grammY to send 'answerInlineQuery' as webhook reply
        // (we do not need a result of this method)
        canUseWebhookReply:
            (method) => ["answerInlineQuery", "sendMessage"].includes(method)
    }
})

// Use error boundary instead of bot.catch so it will work for both polling and webhook
const composer = bot.errorBoundary(async (err) => {
    const e = err.error
    const query = err.ctx?.inlineQuery?.query
    if (e instanceof WikiError) console.error(`[!] WikiError detected on query='${query}':\n`, e)
    else console.error(`Strange error detected on query='${query}':\n`, e)
})

composer.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery.query.trim()

    if (!query) {
        const randomArticle = await getRandomArticleUrl()
        return await ctx.answerInlineQuery([
            InlineQueryResultBuilder
                .article("random", "🎲 Випадкова стаття", {
                    description: "Надіслати випадкову статтю української Вікіпедії!"
                })
                .text(randomArticle)
        ], {
            button: { text: "🔍 Пошук в Вікіпедії…", start_parameter: "help" },
            cache_time: 0,
        })
    }

    const results = await search(query)

    const answer = results.map((r) =>
        InlineQueryResultBuilder
        .article(
            r.pageid.toString(),
            r.title,
            {
                description: r.description,
                thumbnail_url: r.thumbnail?.source,
                thumbnail_width: r.thumbnail?.width,
                thumbnail_height: r.thumbnail?.height,
            })
        .text(new URL(r.title, "https://uk.wikipedia.org/wiki/").toString())
    )

    const button = answer.length
        ? undefined
        : { text: "⛔ Змініть пошуковий запит…", start_parameter: "help" }

    await ctx.answerInlineQuery(answer, { button })
})

composer.command("start", ctx =>
    ctx.reply(`🔍 Хочете <b>швидко</b> надіслати співрозмовнику сторінку з <a href="https://uk.wikipedia.org/">Вікіпедії</a>?

💕 Для цього не потрібно виходити з Telegram! Просто введіть у поле повідомлення:
<blockquote><code>@${ctx.me.username} Ан-225 Мрія</code></blockquote>
для пошуку сторінки про «Мрію»! Спробуйте, це зручно!

📁 Переглянути початковий код бота: github.com/skrwo/wikiukbot`,
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