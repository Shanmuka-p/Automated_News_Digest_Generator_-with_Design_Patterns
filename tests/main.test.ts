import * as fs from 'fs';
import * as path from 'path';
import { generateNewsDigest } from '../src/index';
import * as apiClient from '../src/api/apiClient';
import { ConfigService } from '../src/config/ConfigService';

// Requirement 8: Mock the API client module so unit tests make zero network calls
jest.mock('../src/api/apiClient');

describe('Main Application Pipeline Integration with Mocked API Client', () => {
  const testOutputPath = path.resolve(process.cwd(), 'output', 'test_digest.html');

  beforeEach(() => {
    jest.clearAllMocks();
    ConfigService.resetInstance();
  });

  afterAll(() => {
    // Clean up test generated file
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath);
    }
    ConfigService.resetInstance();
  });

  test('successfully runs end-to-end pipeline with mocked API client and generates valid HTML', async () => {
    // Provide static mock responses with cross-category duplicates
    const mockedFetch = jest.spyOn(apiClient, 'fetchNewsForCategory');
    mockedFetch.mockImplementation(async (category: string) => {
      const lower = category.toLowerCase();
      if (lower === 'technology') {
        return [
          {
            title: 'Tech Innovation 101',
            url: 'https://technews.com/item-1',
            source: 'Tech Daily',
            category: 'technology',
          },
          {
            title: 'Shared Cross-Category Breakthrough',
            url: 'http://syndicated.org/shared-story/',
            source: 'Wire Service',
            category: 'technology',
          },
        ];
      }

      if (lower === 'business') {
        return [
          // Duplicate of the shared breakthrough (https and www)
          {
            title: 'Shared Cross-Category Breakthrough (Duplicate in Business)',
            url: 'https://www.syndicated.org/shared-story',
            source: 'Wire Business',
            category: 'business',
          },
          {
            title: 'Market Rally Sets Highs',
            url: 'https://business.com/markets-1',
            source: 'Financial Times',
            category: 'business',
          },
        ];
      }

      return [
        {
          title: `Headline for ${category}`,
          url: `https://news.org/${lower}/story`,
          source: `${category} Gazette`,
          category: category,
        },
      ];
    });

    const generatedPath = await generateNewsDigest();

    // 1. Verify output file exists
    expect(fs.existsSync(generatedPath)).toBe(true);

    // 2. Read and verify HTML structure against Requirement 4
    const htmlContent = fs.readFileSync(generatedPath, 'utf-8');

    // Exactly one <h1> tag
    const h1Matches = htmlContent.match(/<h1[\s>][^<]*<\/h1>/gi);
    expect(h1Matches).not.toBeNull();
    expect(h1Matches!.length).toBe(1);
    expect(h1Matches![0]).toContain('Daily News Digest');

    // Exactly five <h2> tags for the 5 categories
    const config = ConfigService.getInstance();
    const categories = config.getCategories();
    expect(categories.length).toBe(5);

    const h2Matches = htmlContent.match(/<h2[\s>][^<]*<\/h2>/gi);
    expect(h2Matches).not.toBeNull();
    expect(h2Matches!.length).toBe(5);

    for (const cat of categories) {
      const catRegex = new RegExp(`<h2[^>]*>\\s*${cat}\\s*<\\/h2>`, 'i');
      expect(catRegex.test(htmlContent)).toBe(true);
    }

    // Following each <h2>, there must be a <ul> with <li> and <a href="...">
    const ulMatches = htmlContent.match(/<ul[\s\S]*?<\/ul>/gi);
    expect(ulMatches).not.toBeNull();
    expect(ulMatches!.length).toBe(5);

    for (const ul of ulMatches!) {
      expect(ul).toContain('<li');
      expect(ul).toMatch(/<a\s+[^>]*href=["'][^"']+["'][^>]*>/i);
    }

    // Verify deduplication: the duplicate url should only appear once
    const sharedStoryOccurrences = (htmlContent.match(/syndicated\.org\/shared-story/gi) || []).length;
    expect(sharedStoryOccurrences).toBe(1);

    // Verify API client was called 5 times (once per category) without any real network calls
    expect(mockedFetch).toHaveBeenCalledTimes(5);
  });
});
