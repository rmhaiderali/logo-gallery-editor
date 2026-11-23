function stringify(text, tagStart, tagEnd) {
  const logos = JSON.parse(text)

  const sortedLogos = logos.sort((a, b) => a[1][0].localeCompare(b[1][0]))

  const groupedLogos = Object.groupBy(sortedLogos, (logo) => {
    const firstChar = logo[1][0].charAt(0).toUpperCase()
    if (firstChar.match(/[0-9]/)) return "Number"
    return firstChar
  })

  const numberLogos = groupedLogos.Number
  delete groupedLogos.Number

  const sortedGroups = Object.entries(groupedLogos).sort((a, b) =>
    a[0].localeCompare(b[0]),
  )

  sortedGroups.unshift(["Number", numberLogos])

  const lines = []

  for (const [groupName, groupLogos] of sortedGroups) {
    lines.push("|-|")
    lines.push(groupName + "=")
    lines.push(tagStart)
    for (const [image, searchTerms] of groupLogos) {
      lines.push(
        image +
          "|Icon for " +
          searchTerms.map((q) => '"' + q + '"').join(" or "),
      )
    }
    lines.push(tagEnd)
  }

  return lines.join("\n")
}
