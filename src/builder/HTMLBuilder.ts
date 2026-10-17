import { Article } from '../types/article';

/**
 * Escapes special HTML characters to prevent XSS and formatting breakage.
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * HTMLBuilder
 *
 * Implements the Builder design pattern to incrementally assemble complex HTML documents.
 *
 * Why Builder pattern here?
 * 1. Encapsulates document assembly details (DOCTYPE, meta tags, head, CSS styling, semantics).
 * 2. Provides step-by-step construction (header, sections, footer) decoupled from data fetching.
 * 3. Easily extensible: allows adding styling, themes, or alternate formats without altering orchestrator logic.
 */
export class HTMLBuilder {
  private parts: string[] = [];

  constructor() {
    this.parts.push('<!DOCTYPE html>');
    this.parts.push('<html lang="en">');
    this.parts.push('<head>');
    this.parts.push('  <meta charset="UTF-8">');
    this.parts.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    this.parts.push('  <title>Daily Automated News Digest</title>');
    this.parts.push('  <style>');
    this.parts.push('    :root {');
    this.parts.push('      --bg-color: #0f172a;');
    this.parts.push('      --card-bg: #1e293b;');
    this.parts.push('      --text-main: #f8fafc;');
    this.parts.push('      --text-muted: #94a3b8;');
    this.parts.push('      --accent: #38bdf8;');
    this.parts.push('      --accent-hover: #0ea5e9;');
    this.parts.push('      --border: #334155;');
    this.parts.push('    }');
    this.parts.push('    body {');
    this.parts.push('      margin: 0;');
    this.parts.push('      padding: 2.5rem 1rem;');
    this.parts.push('      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;');
    this.parts.push('      background-color: var(--bg-color);');
    this.parts.push('      color: var(--text-main);');
    this.parts.push('      line-height: 1.6;');
    this.parts.push('    }');
    this.parts.push('    .container {');
    this.parts.push('      max-width: 900px;');
    this.parts.push('      margin: 0 auto;');
    this.parts.push('    }');
    this.parts.push('    header {');
    this.parts.push('      text-align: center;');
    this.parts.push('      margin-bottom: 3rem;');
    this.parts.push('      padding-bottom: 1.5rem;');
    this.parts.push('      border-bottom: 1px solid var(--border);');
    this.parts.push('    }');
    this.parts.push('    h1 {');
    this.parts.push('      font-size: 2.5rem;');
    this.parts.push('      margin-bottom: 0.5rem;');
    this.parts.push('      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);');
    this.parts.push('      -webkit-background-clip: text;');
    this.parts.push('      -webkit-text-fill-color: transparent;');
    this.parts.push('    }');
    this.parts.push('    .category-section {');
    this.parts.push('      background-color: var(--card-bg);');
    this.parts.push('      border-radius: 12px;');
    this.parts.push('      padding: 1.5rem 2rem;');
    this.parts.push('      margin-bottom: 2rem;');
    this.parts.push('      border: 1px solid var(--border);');
    this.parts.push('      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);');
    this.parts.push('    }');
    this.parts.push('    h2 {');
    this.parts.push('      font-size: 1.5rem;');
    this.parts.push('      margin-top: 0;');
    this.parts.push('      margin-bottom: 1rem;');
    this.parts.push('      text-transform: capitalize;');
    this.parts.push('      color: var(--accent);');
    this.parts.push('      display: flex;');
    this.parts.push('      align-items: center;');
    this.parts.push('      gap: 0.5rem;');
    this.parts.push('    }');
    this.parts.push('    ul {');
    this.parts.push('      list-style-type: none;');
    this.parts.push('      padding-left: 0;');
    this.parts.push('      margin: 0;');
    this.parts.push('    }');
    this.parts.push('    li {');
    this.parts.push('      padding: 0.85rem 0;');
    this.parts.push('      border-bottom: 1px solid var(--border);');
    this.parts.push('      display: flex;');
    this.parts.push('      flex-direction: column;');
    this.parts.push('      gap: 0.25rem;');
    this.parts.push('    }');
    this.parts.push('    li:last-child {');
    this.parts.push('      border-bottom: none;');
    this.parts.push('    }');
    this.parts.push('    a {');
    this.parts.push('      color: var(--text-main);');
    this.parts.push('      text-decoration: none;');
    this.parts.push('      font-size: 1.05rem;');
    this.parts.push('      font-weight: 500;');
    this.parts.push('      transition: color 0.2s ease;');
    this.parts.push('    }');
    this.parts.push('    a:hover {');
    this.parts.push('      color: var(--accent);');
    this.parts.push('      text-decoration: underline;');
    this.parts.push('    }');
    this.parts.push('    .article-source {');
    this.parts.push('      font-size: 0.85rem;');
    this.parts.push('      color: var(--text-muted);');
    this.parts.push('    }');
    this.parts.push('    footer {');
    this.parts.push('      text-align: center;');
    this.parts.push('      margin-top: 3rem;');
    this.parts.push('      padding-top: 1.5rem;');
    this.parts.push('      border-top: 1px solid var(--border);');
    this.parts.push('      color: var(--text-muted);');
    this.parts.push('      font-size: 0.9rem;');
    this.parts.push('    }');
    this.parts.push('  </style>');
    this.parts.push('</head>');
    this.parts.push('<body>');
    this.parts.push('  <div class="container">');
  }

  /**
   * Adds the main digest header with a single <h1> tag.
   */
  public addHeader(title: string): this {
    this.parts.push('    <header>');
    this.parts.push(`      <h1>${escapeHtml(title)}</h1>`);
    this.parts.push('    </header>');
    return this;
  }

  /**
   * Adds a category section containing an <h2> tag followed by a <ul> list.
   * Each list item contains an <a> tag pointing to the article URL.
   */
  public addSection(category: string, articles: Article[]): this {
    this.parts.push('    <section class="category-section">');
    this.parts.push(`      <h2>${escapeHtml(category)}</h2>`);
    this.parts.push('      <ul>');

    if (!articles || articles.length === 0) {
      this.parts.push('        <li>');
      this.parts.push('          <a href="#">No articles found in this category.</a>');
      this.parts.push('        </li>');
    } else {
      for (const article of articles) {
        const titleText = escapeHtml(article.title || 'Untitled Article');
        const urlLink = escapeHtml(article.url || '#');
        const sourceText = article.source ? `<span class="article-source">Source: ${escapeHtml(article.source)}</span>` : '';

        this.parts.push('        <li>');
        this.parts.push(`          <a href="${urlLink}">${titleText}</a>`);
        if (sourceText) {
          this.parts.push(`          ${sourceText}`);
        }
        this.parts.push('        </li>');
      }
    }

    this.parts.push('      </ul>');
    this.parts.push('    </section>');
    return this;
  }

  /**
   * Closes the main container, adds the footer with timestamp, and closes body/html.
   */
  public addFooter(footerText?: string): this {
    const text = footerText || `Generated on ${new Date().toUTCString()} by Automated News Digest Generator`;
    this.parts.push('    <footer>');
    this.parts.push(`      <p>${escapeHtml(text)}</p>`);
    this.parts.push('    </footer>');
    this.parts.push('  </div>');
    this.parts.push('</body>');
    this.parts.push('</html>');
    return this;
  }

  /**
   * Returns the completed, concatenated HTML string.
   */
  public build(): string {
    return this.parts.join('\n');
  }
}
