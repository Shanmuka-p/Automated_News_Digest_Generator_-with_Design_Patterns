import { Article } from '../types/article';

/**
 * Normalizes a URL string to canonical form for deduplication.
 *
 * Transformation steps:
 * 1. Trim whitespace and convert to lowercase.
 * 2. Strip leading http:// or https:// protocol.
 * 3. Strip leading 'www.' subdomain.
 * 4. Remove any trailing slashes ('/').
 *
 * Examples:
 *   'http://a.com'           -> 'a.com'
 *   'https://www.a.com/'     -> 'a.com'
 *   'https://example.com/tech/' -> 'example.com/tech'
 */
export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) {
    return '';
  }

  let normalized = rawUrl.trim().toLowerCase();

  // Remove protocol (http:// or https://)
  normalized = normalized.replace(/^https?:\/\//i, '');

  // Remove 'www.' prefix
  normalized = normalized.replace(/^www\./i, '');

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

/**
 * Deduplicates an array of articles based on their normalized URLs.
 *
 * Preserves the first encountered instance of each unique article and uses
 * a HashSet (Set<string>) to guarantee O(1) URL lookup times, yielding
 * an optimal O(N) overall time complexity.
 *
 * @param articles - Raw array of fetched news articles
 * @returns Array of unique articles
 */
export function deduplicateArticles(articles: Article[]): Article[] {
  const seenUrls = new Set<string>();
  const uniqueArticles: Article[] = [];

  for (const article of articles) {
    if (!article || !article.url) {
      continue;
    }

    const normalized = normalizeUrl(article.url);
    if (!seenUrls.has(normalized)) {
      seenUrls.add(normalized);
      uniqueArticles.push(article);
    }
  }

  return uniqueArticles;
}
