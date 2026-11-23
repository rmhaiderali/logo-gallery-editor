export const EXPORT_NOTE = [
  "<!--",
  "READ THIS BEFORE EDITING",
  "",
  "Please make your changes in the editor instead of modifying the raw text.",
  "It automatically handles formatting, sorting, grouping by first letter, and help prevent errors.",
  "",
  "Editor: https://rmhaiderali.github.io/logo-gallery-editor",
  "-->",
].join("\n")

const cleanTerms = (terms) =>
  terms.map((t) => t.replace(/"/g, "").trim()).filter(Boolean)

// "a"
// "a" and "b"
// "a", "b", and "c"
const joinTerms = (terms) => {
  const quoted = terms.map((q) => '"' + q + '"')
  if (quoted.length <= 2) return quoted.join(" and ")
  return quoted.slice(0, -1).join(", ") + ", and " + quoted[quoted.length - 1]
}

const logoLine = (logo) => {
  const terms = cleanTerms(logo.terms)
  return logo.image.trim() + "|Icon for " + joinTerms(terms)
}

const sortKey = (logo) => cleanTerms(logo.terms)[0] ?? logo.image

/**
 * Turn an array of { image, terms } into the HTML-like format.
 * Logos are always sorted by first search term. With grouped=true they are
 * also split into "|-|" / "X=" letter sections (Number first); otherwise a
 * single gallery is produced.
 */
export function stringify(logos, tagStart, tagEnd, grouped = true) {
  const valid = logos.filter((l) => l.image.trim())

  const sorted = [...valid].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))

  if (!grouped) {
    return [EXPORT_NOTE, tagStart, ...sorted.map(logoLine), tagEnd].join("\n")
  }

  const groups = new Map()
  for (const logo of sorted) {
    const first = sortKey(logo).charAt(0).toUpperCase()
    const name = /[0-9]/.test(first)
      ? "Number"
      : /\p{L}/u.test(first)
        ? first
        : "Other"
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(logo)
  }

  const rank = (name) => (name === "Number" ? 0 : name === "Other" ? 2 : 1)
  const ordered = [...groups.entries()].sort(
    (a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]),
  )

  const lines = []
  ordered.forEach(([name, items], i) => {
    lines.push("|-|")
    lines.push(name + "=")
    if (i === 0) lines.push(EXPORT_NOTE)
    lines.push(tagStart)
    for (const logo of items) lines.push(logoLine(logo))
    lines.push(tagEnd)
  })
  return lines.join("\n")
}
