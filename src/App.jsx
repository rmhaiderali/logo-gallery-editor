import { useMemo, useState } from "react"
import { parse, newId } from "./utils/parse.js"
import { stringify } from "./utils/stringify.js"

// prettier-ignore
const DEFAULT_GALLERY_START = '<gallery spacing="small" captionalign="center" position="center" widths="100" bordersize="none" bordercolor="transparent" hideaddbutton="true">'
const DEFAULT_GALLERY_END = "</gallery>"
const PAGE_SIZE = 100

function TermsEditor({ terms, onChange }) {
  const update = (i, value) =>
    onChange(terms.map((t, idx) => (idx === i ? value : t)))
  const remove = (i) => onChange(terms.filter((_, idx) => idx !== i))

  return (
    <div className="terms">
      {terms.map((term, i) => (
        <span className="term" key={i}>
          <input
            value={term}
            size={Math.max(term.length, 4)}
            onChange={(e) => update(i, e.target.value)}
            aria-label={`Search term ${i + 1}`}
          />
          <button
            type="button"
            className="icon"
            title="Remove term"
            onClick={() => remove(i)}
          >
            ×
          </button>
        </span>
      ))}
      <button
        type="button"
        className="ghost"
        onClick={() => onChange([...terms, ""])}
      >
        + Search Term
      </button>
    </div>
  )
}

function LogoRow({ logo, onChange, onRemove }) {
  return (
    <div className="row">
      <input
        className="image"
        value={logo.image}
        placeholder="image file name.png"
        onChange={(e) => onChange({ ...logo, image: e.target.value })}
        aria-label="Image"
      />
      <TermsEditor
        terms={logo.terms}
        onChange={(terms) => onChange({ ...logo, terms })}
      />
      <button
        type="button"
        className="danger"
        title="Remove logo"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  )
}

function App() {
  const [input, setInput] = useState("")
  const [logos, setLogos] = useState([])
  const [startTag, setStartTag] = useState(DEFAULT_GALLERY_START)
  const [endTag, setEndTag] = useState(DEFAULT_GALLERY_END)
  const [grouped, setGrouped] = useState(true)
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [status, setStatus] = useState("")
  const [copied, setCopied] = useState(false)

  const handleParse = () => {
    const result = parse(input)
    if (result.logos.length === 0) {
      setStatus("No <gallery> entries found in the pasted text.")
      return
    }
    setLogos(result.logos)
    if (result.startTag) setStartTag(result.startTag)
    if (result.endTag) setEndTag(result.endTag)
    setLimit(PAGE_SIZE)
    setStatus(`Loaded ${result.logos.length} logos.`)
  }

  const updateLogo = (id, next) =>
    setLogos((all) => all.map((l) => (l.id === id ? next : l)))
  const removeLogo = (id) => setLogos((all) => all.filter((l) => l.id !== id))

  const addLogo = () => {
    setQuery("")
    setLogos((all) => [{ id: newId(), image: "", terms: [""] }, ...all])
    setLimit((n) => Math.max(n, PAGE_SIZE))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return logos
    return logos.filter(
      (l) =>
        l.image.toLowerCase().includes(q) ||
        l.terms.some((t) => t.toLowerCase().includes(q)),
    )
  }, [logos, query])

  const output = useMemo(
    () => (logos.length ? stringify(logos, startTag, endTag, grouped) : ""),
    [logos, startTag, endTag, grouped],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setStatus("Copy failed - select the output text and copy it manually.")
    }
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([output], { type: "text/html" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "logos.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app">
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
        href="https://github.com/rmhaiderali/logo-gallery-editor"
      >
        <h1>Logo Gallery Editor</h1>
      </a>

      <section className="panel">
        <h2>1. Import</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste copied text here"
          rows={6}
        />
        <div className="actions">
          <button type="button" className="primary" onClick={handleParse}>
            Parse
          </button>
          {logos.length > 0 && (
            <span className="hint">
              Parsing again replaces your current edits.
            </span>
          )}
          {status && <span className="hint">{status}</span>}
        </div>
      </section>

      <section className="panel">
        <h2>2. Edit logos ({logos.length})</h2>
        <div className="actions">
          <input
            type="search"
            className="search"
            placeholder="Filter by image or search term"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setLimit(PAGE_SIZE)
            }}
          />
          <button type="button" className="primary" onClick={addLogo}>
            + Add logo
          </button>
        </div>

        {logos.length === 0 ? (
          <p className="empty">
            Nothing yet. Parse some text above, or add a logo to start from
            scratch.
          </p>
        ) : (
          <>
            <div className="list">
              {filtered.slice(0, limit).map((logo) => (
                <LogoRow
                  key={logo.id}
                  logo={logo}
                  onChange={(next) => updateLogo(logo.id, next)}
                  onRemove={() => removeLogo(logo.id)}
                />
              ))}
            </div>
            {filtered.length === 0 && <p className="empty">No matches.</p>}
            {filtered.length > limit && (
              <button
                type="button"
                className="ghost"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
              >
                Show more ({filtered.length - limit} remaining)
              </button>
            )}
          </>
        )}
      </section>

      <section className="panel">
        <h2>3. Export</h2>
        <label className="field">
          <span>Start tag</span>
          <input
            value={startTag}
            onChange={(e) => setStartTag(e.target.value)}
          />
        </label>
        <label className="field">
          <span>End tag</span>
          <input value={endTag} onChange={(e) => setEndTag(e.target.value)} />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={grouped}
            onChange={(e) => setGrouped(e.target.checked)}
          />
          Group by letter A-Z
        </label>
        <textarea className="output" value={output} readOnly rows={12} />
        {output && <span>Logos are sorted by first search term</span>}
        <div className="actions">
          <button
            type="button"
            className="primary"
            onClick={copy}
            disabled={!output}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          {/* <button type="button" onClick={download} disabled={!output}>
            Download .html
          </button> */}
        </div>
      </section>
    </main>
  )
}

export default App
