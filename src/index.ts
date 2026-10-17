import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from './config/ConfigService';
import { fetchNewsForCategory } from './api/apiClient';
import { deduplicateArticles } from './utils/deduplication';
import { HTMLBuilder } from './builder/HTMLBuilder';
import { Article } from './types/article';

/**
 * Main application orchestrator for generating the automated news digest.
 *
 * Execution Pipeline:
 * 1. Load configuration via Singleton ConfigService.
 * 2. Concurrently or sequentially fetch headlines across the 5 categories using the API client.
 * 3. Aggregate all articles into a consolidated pool.
 * 4. Run URL-canonical deduplication logic.
 * 5. Organize unique articles back into their corresponding category groups.
 * 6. Use HTMLBuilder to construct the document structure (Header, 5 Category Sections, Footer).
 * 7. Ensure output directory exists and write final HTML file to disk.
 *
 * @returns Path to the generated digest HTML file
 */
export async function generateNewsDigest(): Promise<string> {
  console.log('--------------------------------------------------');
  console.log('Automated News Digest Generator');
  console.log('--------------------------------------------------');

  // Step 1: Access Singleton Configuration
  const config = ConfigService.getInstance();
  const categories = config.getCategories();
  const outputFile = config.getOutputFile();

  console.log(`[Config] Loaded ${categories.length} categories: ${categories.join(', ')}`);
  console.log(`[Config] Target output: ${outputFile}`);

  // Step 2: Fetch articles for each category
  const rawArticles: Article[] = [];
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(`[API] Fetching headlines for category: "${category}"...`);
    const articles = await fetchNewsForCategory(category);
    console.log(`[API] Received ${articles.length} articles for "${category}".`);
    rawArticles.push(...articles);

    // Polite rate-limiting delay between requests (GNews free tier allows max 1 req/sec)
    if (process.env.NODE_ENV !== 'test' && i < categories.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  console.log(`[Processor] Total articles collected across all categories: ${rawArticles.length}`);

  // Step 3: Deduplicate articles based on normalized URLs
  const uniqueArticles = deduplicateArticles(rawArticles);
  const duplicatesCount = rawArticles.length - uniqueArticles.length;
  console.log(`[Processor] Deduplication complete. Removed ${duplicatesCount} duplicate(s). Unique: ${uniqueArticles.length}`);

  // Step 4: Reorganize unique articles into their original categories
  const categoryMap = new Map<string, Article[]>();
  for (const cat of categories) {
    categoryMap.set(cat.toLowerCase(), []);
  }

  for (const article of uniqueArticles) {
    const catKey = (article.category || '').toLowerCase();
    if (categoryMap.has(catKey)) {
      categoryMap.get(catKey)!.push(article);
    } else {
      // Fallback if category key format differs
      const matched = categories.find((c) => c.toLowerCase() === catKey);
      if (matched) {
        categoryMap.get(matched.toLowerCase())!.push(article);
      }
    }
  }

  // Step 5: Construct HTML using the Builder pattern
  console.log('[Builder] Constructing HTML document...');
  const builder = new HTMLBuilder();
  builder.addHeader('Daily News Digest');

  for (const category of categories) {
    const articlesForCategory = categoryMap.get(category.toLowerCase()) || [];
    builder.addSection(category, articlesForCategory);
  }

  builder.addFooter();
  const finalHtml = builder.build();

  // Step 6: Write to disk
  const resolvedOutputPath = path.isAbsolute(outputFile)
    ? outputFile
    : path.resolve(process.cwd(), outputFile);

  const outputDir = path.dirname(resolvedOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(resolvedOutputPath, finalHtml, 'utf-8');
  console.log(`[Success] News digest generated successfully at: ${resolvedOutputPath}`);
  console.log('--------------------------------------------------');

  return resolvedOutputPath;
}

// Auto-run if executed directly via CLI (npm start or ts-node src/index.ts)
if (require.main === module) {
  generateNewsDigest().catch((err) => {
    console.error('[Fatal Error] Failed to generate news digest:', err);
    process.exit(1);
  });
}
