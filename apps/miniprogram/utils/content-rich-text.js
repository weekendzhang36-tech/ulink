function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function paragraphsFromText(value) {
  return String(value || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('')
}

function formatContentArticle(article) {
  const body = typeof article.body === 'string' && article.body.trim() ? article.body : article.summary || ''
  const bodyHtml =
    typeof article.bodyHtml === 'string' && article.bodyHtml.trim()
      ? article.bodyHtml
      : paragraphsFromText(body)

  return {
    ...article,
    body,
    bodyHtml,
    hasRichBody: Boolean(bodyHtml),
  }
}

module.exports = {
  formatContentArticle,
}
