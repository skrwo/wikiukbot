/**
 * @file Interacts with Wikipedia API
 */

/**
 * A dummy error class we will use to identify errors with API
 */
export class WikiError extends Error {}

/**
 * Calls the Wikipedia API with the given params
 * @param {Record<string, string | number>} params
 * @returns {Promise<any>}
 * @throws {WikiError}
 */
async function callApi(params) {
    const query = new URLSearchParams(params).toString()

    const response = await fetch(`https://uk.wikipedia.org/w/api.php?${query}`)

    // if the response status !== 200 we trow a WikiError with its status and status description
    if (!response.ok) {
        throw new WikiError(
            `HTTP error: ${response.status} ${response.statusText}`,
        )
    }

    const body = await response.json()

    if ("error" in body) {
        throw new WikiError(
            `API error: code='${body.error.code}', info='${body.error.info}'`,
        )
    }

    return body
}

/**
 * Perform a wikipedia search with the given query. Returns an array of result objects
 * @param {string} query
 *
 * @typedef {{
 *  pageid: number
 *  ns: number
 *  title: string
 *  index: number
 *  thumbnail?: {
 *      source: string
 *      width: number
 *      height: number
 *  }
 *  description: string
 *  descriptionsource: string
 * }} WikiPage
 *
 * @returns {Promise<WikiPage[]>}
 *
 * @throws {WikiError}
 */
export async function search(query) {
    const body = await callApi({
        action: "query",
        format: "json",
        formatversion: 2,
        prop: "pageprops|pageimages|description",
        generator: "prefixsearch",
        ppprop: "displaytitle",
        piprop: "thumbnail",
        pithumbsize: 120,
        redirects: "",
        gpssearch: query,
        gpslimit: 15,
    })

    /**
     * @type {WikiPage[]}
     */
    // body may not contain the 'query' key if results are empty
    const result = body.query?.pages ?? []

    // sort results by 'index' property (lower first)
    result.sort((a, b) => a.index - b.index)

    return result
}

/**
 * Get the random article from the Wikipedia API
 *
 * @typedef {{
 *  id: number
 *  ns: number
 *  title: string
 * }} RandomWikiPage
 *
 * @returns {Promise<RandomWikiPage>}
 *
 * @throws {WikiError}
 */
export async function getRandomArticle() {
    const body = await callApi({
        action: "query",
        list: "random",
        format: "json",
        formatversion: 2,
        rnnamespace: 0,
    })

    const result = body.query.random[0]

    return result
}
