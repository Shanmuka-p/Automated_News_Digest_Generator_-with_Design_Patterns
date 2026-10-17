import { HTMLBuilder } from '../src/builder/HTMLBuilder';
import { Article } from '../src/types/article';

describe('HTMLBuilder Builder Pattern', () => {
  test('demonstrates incremental construction calling addHeader() and addSection() before build()', () => {
    const builder = new HTMLBuilder();

    // Calling multiple builder methods incrementally
    builder.addHeader('Daily News Digest');

    const sampleArticles: Article[] = [
      {
        title: 'Quantum Leap in AI Computing',
        url: 'https://example.com/quantum-ai',
        source: 'TechCrunch',
      },
    ];

    builder.addSection('Technology', sampleArticles);
    const htmlOutput = builder.build();

    // Verify requirement 6: contains corresponding HTML fragments (<h1>, <h2>, <ul>, <li>, <a>)
    expect(htmlOutput).toContain('<h1>Daily News Digest</h1>');
    expect(htmlOutput).toContain('<h2>Technology</h2>');
    expect(htmlOutput).toContain('<ul>');
    expect(htmlOutput).toContain('<li>');
    expect(htmlOutput).toContain('<a href="https://example.com/quantum-ai">Quantum Leap in AI Computing</a>');
  });

  test('assembles complete document with all 5 category sections and footer', () => {
    const builder = new HTMLBuilder();
    builder.addHeader('Global Headlines Digest');

    const categories = ['technology', 'business', 'science', 'health', 'sports'];
    for (const cat of categories) {
      builder.addSection(cat, [
        {
          title: `Headline for ${cat}`,
          url: `https://news.org/${cat}/story-1`,
          source: `${cat} Network`,
        },
      ]);
    }

    builder.addFooter('Copyright 2026 Digest');
    const finalHtml = builder.build();

    // Assert DOCTYPE, html structure, single <h1>, five <h2> tags
    expect(finalHtml).toContain('<!DOCTYPE html>');
    expect(finalHtml).toContain('<html lang="en">');
    expect((finalHtml.match(/<h1[\s>]/g) || []).length).toBe(1);
    expect((finalHtml.match(/<h2[\s>]/g) || []).length).toBe(5);
    expect(finalHtml).toContain('<footer>');
    expect(finalHtml).toContain('Copyright 2026 Digest');
    expect(finalHtml).toContain('</body>');
    expect(finalHtml).toContain('</html>');
  });

  test('escapes special characters to prevent HTML injection', () => {
    const builder = new HTMLBuilder();
    builder.addHeader('Test & Title <Special>');
    builder.addSection('Sec & Test', [
      {
        title: 'Story <script>alert(1)</script>',
        url: 'https://example.com/?q=1&v=2',
        source: 'Test "Quotes"',
      },
    ]);
    const output = builder.build();

    expect(output).toContain('Test &amp; Title &lt;Special&gt;');
    expect(output).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(output).not.toContain('<script>alert(1)</script>');
  });
});
