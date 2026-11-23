import { JSDOM } from "jsdom"

function parse(text) {
  const dom = new JSDOM(text)
  const document = dom.window.document

  const logos = [...document.querySelectorAll("gallery")]
    .map((g) => g.innerHTML.trim().split("\n"))
    .flat()

  const imagesAndSearchTerms = logos.map((logo) => {
    const [image, text] = logo.split("|")
    const searchTerms = text.match(/".+?"/g).map((l) => l.slice(1, -1))
    return [image, searchTerms]
  })

  return JSON.stringify(imagesAndSearchTerms)
}
