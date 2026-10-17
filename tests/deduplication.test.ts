import { deduplicateArticles, normalizeUrl } from '../src/utils/deduplication';
import { Article } from '../src/types/article';

describe('Deduplication and URL Normalization', () => {
  describe('normalizeUrl()', () => {
    test('normalizes URLs by stripping protocol, www, trailing slashes, and converting to lowercase', () => {
      expect(normalizeUrl('http://a.com')).toBe('a.com');
      expect(normalizeUrl('https://www.a.com/')).toBe('a.com');
      expect(normalizeUrl('HTTPS://WWW.EXAMPLE.COM/news/item/')).toBe('example.com/news/item');
      expect(normalizeUrl('http://example.com/tech')).toBe('example.com/tech');
    });

    test('handles empty and whitespace-only strings gracefully', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('   ')).toBe('');
    });
  });

  describe('deduplicateArticles()', () => {
    test('removes duplicate articles where URLs normalize to the same value', () => {
      // Controlled dataset required by Requirement 7
      const sampleArticles: Article[] = [
        {
          title: 'Article 1 (Original)',
          url: 'http://a.com',
          source: 'TechTimes',
          category: 'technology',
        },
        {
          title: 'Article 1 (Duplicate with HTTPS and www and trailing slash)',
          url: 'https://www.a.com/',
          source: 'TechTimes Syndicated',
          category: 'business',
        },
        {
          title: 'Article 2 (Distinct Article)',
          url: 'https://b.com/news/1',
          source: 'ScienceDaily',
          category: 'science',
        },
        {
          title: 'Article 3 (Distinct Article with uppercase)',
          url: 'HTTP://WWW.C.COM/headline/',
          source: 'HealthPulse',
          category: 'health',
        },
        {
          title: 'Article 3 (Duplicate variant of C)',
          url: 'https://c.com/headline',
          source: 'HealthPulse Aggregator',
          category: 'sports',
        },
      ];

      const result = deduplicateArticles(sampleArticles);

      // We had 5 articles with 2 duplicates -> should result in exactly 3 unique articles
      expect(result.length).toBe(3);

      // Verify that the original instances are preserved and duplicates removed
      expect(result[0].title).toBe('Article 1 (Original)');
      expect(result[0].url).toBe('http://a.com');

      expect(result[1].title).toBe('Article 2 (Distinct Article)');
      expect(result[1].url).toBe('https://b.com/news/1');

      expect(result[2].title).toBe('Article 3 (Distinct Article with uppercase)');
      expect(result[2].url).toBe('HTTP://WWW.C.COM/headline/');
    });

    test('returns empty array when input is empty', () => {
      expect(deduplicateArticles([])).toEqual([]);
    });

    test('filters out invalid article items with missing URLs', () => {
      const invalidArticles = [
        { title: 'No URL', url: '', source: 'Unknown' },
        { title: 'Valid Article', url: 'https://example.com/test', source: 'Source' },
      ];
      const result = deduplicateArticles(invalidArticles as Article[]);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Valid Article');
    });
  });
});
