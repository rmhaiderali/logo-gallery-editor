const GALLERY_RE = /(<gallery\b[^>]*>)([\s\S]*?)(<\/gallery\s*>)/gi

let nextId = 1
export const newId = () => "logo" + nextId++

/**
 * Parse HTML-like text containing one or more <gallery> blocks.
 * Each line inside a gallery looks like:  image.png|Icon for "A" or "B"
 *
 * Returns { logos, startTag, endTag } where startTag/endTag are taken from
 * the first gallery found (or null if there is none).
 */
export function parse(text) {
  const logos = []
  let startTag = null
  let endTag = null

  for (const match of text.matchAll(GALLERY_RE)) {
    if (startTag === null) {
      startTag = match[1]
      endTag = match[3]
    }

    for (const rawLine of match[2].split("\n")) {
      const line = rawLine.trim()
      if (!line) continue

      const pipe = line.indexOf("|")
      const image = (pipe === -1 ? line : line.slice(0, pipe)).trim()
      const caption = pipe === -1 ? "" : line.slice(pipe + 1)
      const terms = (caption.match(/"(.*?)"/g) ?? []).map((t) => t.slice(1, -1))

      logos.push({ id: newId(), image, terms })
    }
  }

  return { logos, startTag, endTag }
}
