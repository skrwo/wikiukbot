/**
 * A dummy error class we will use to identify errors with API
 */
export class WikiError extends Error {}

/**
 * Perform a wikipedia search with the given query. Returns an array of result objects
 * @param {string} query 
 * 
 * @returns {Promise<{
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
 * }[]>} 
 */
export async function search(query) {

    const params = new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: 2,
        prop: "pageprops|pageprops|pageimages|description",
        generator: "prefixsearch",
        ppprop: "displaytitle",
        piprop: "thumbnail",
        pithumbsize: 120,
        redirects: "",
        gpssearch: query,
        gpslimit: 15
    }).toString()

    const response = await fetch(`https://uk.wikipedia.org/w/api.php?${params}`)

    // if the response status !== 200 we trow a WikiError with its status and status description
    if (!response.ok) throw new WikiError(`HTTP error: ${response.status} ${response.statusText}`)
    
    const body = await response.json()

    if ("error" in body) throw new WikiError(`API error: code='${body.code}', info='${body.info}'`)
    
    // body may not contain 'query' key if results are empty
    return body.query?.pages ?? []
}
/**
 * @returns {Promise<string>} the random article URL
 */
export async function getRandomArticleUrl() {
    const response = await fetch("https://uk.wikipedia.org/wiki/Спеціальна:Випадкова_сторінка", {
        redirect: "manual"
    })

    if (response.status !== 302) throw new WikiError(`HTTP error: ${response.status} ${response.statusText}`)
    
    // get the redirect location
    const article = response.headers.get("location")

    if (!article || !(article.startsWith("https://uk.wikipedia.org/wiki/")))
        throw new WikiError(`Wrong redirect location: ${article}`)

    return article
}