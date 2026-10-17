# Automated News Digest Generator with Design Patterns

A robust, enterprise-grade Node.js and TypeScript command-line application that aggregates daily top headlines across multiple news categories from a public REST API, deduplicates cross-category syndicated articles using canonical URL normalization, and constructs a clean, modern HTML daily digest using classical Object-Oriented Design Patterns (**Singleton** and **Builder**).

---

## Architecture & Design Patterns

### 1. Singleton Pattern (`ConfigService`)
- **Intent**: Ensures that a class has only one instance and provides a global point of access to it.
- **Why it was used**: Configuration (`config.json`) needs to be read from disk only once at startup (optimizing file I/O). The `ConfigService` provides a centralized, immutable source of truth for the API key, target categories, and output destination across all modules without having to pass configuration objects across multiple function parameters ("prop drilling").
- **Key Implementation Highlights**:
  - `private static instance: ConfigService | null`: Holds the cached singleton instance.
  - `private constructor()`: Disallows external invocation of `new ConfigService()`.
  - `public static getInstance()`: Thread-safe lazy instantiation and global access point.
  - Read-only getters with defensive array copying (`[...this.config.categories]`) preventing external mutation of internal state.

### 2. Builder Pattern (`HTMLBuilder`)
- **Intent**: Separates the construction of a complex object from its representation so that the same construction process can create different representations.
- **Why it was used**: Generating an HTML digest involves multiple complex steps: assembling DOCTYPE, `<head>`, metadata, responsive typography and CSS variables, headers, dynamic category lists with sanitized anchors, and structured footers. The Builder pattern encapsulates all HTML markup syntax and escaping rules behind clean, high-level API methods (`addHeader()`, `addSection()`, `addFooter()`, `build()`).
- **Key Implementation Highlights**:
  - Encapsulated DOM generation preventing malformed tags and string concatenation bugs.
  - Automatic HTML escaping of article titles, URLs, and source metadata to protect against HTML injection / XSS.
  - Fluent interface allowing method chaining or step-by-step modular assembly.

### 3. URL Canonical Normalization & Deduplication
Articles are frequently syndicated across multiple categories (e.g., a tech stock story might appear under both `technology` and `business`). The deduplication engine normalizes URLs before comparison:
1. Trims whitespace and converts to lowercase.
2. Removes transport protocol prefixes (`http://`, `https://`).
3. Strips `www.` subdomains.
4. Trims trailing slashes (`/`).
5. Uses a `Set<string>` hash set to achieve optimal **$O(N)$** linear time complexity with **$O(1)$** lookup.

---

## Setup

Follow these steps to set up the project locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Automated_News_Digest_Generator_-with_Design_Patterns
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## Configuration

The application is configured using a `config.json` file located in the root directory.

1. **Create `config.json` from the example template**:
   ```bash
   cp config.json.example config.json
   ```
   *(On Windows Command Prompt / PowerShell, use `copy config.json.example config.json`)*

2. **Configure your API Key and Categories**:
   Open `config.json` and insert your API key (from [GNews](https://gnews.io) or [NewsAPI](https://newsapi.org)). Note that exactly 5 categories are required:

   ```json
   {
     "apiKey": "YOUR_API_KEY_HERE",
     "categories": [
       "technology",
       "business",
       "science",
       "health",
       "sports"
     ],
     "outputFile": "output/digest.html"
   }
   ```

   > **Note on Resilient Fallback**: If an API key is not yet configured or if external network rate limits are encountered, the application incorporates a graceful fallback mechanism providing verified sample articles for each category so that digest generation never fails.

---

## Running the Application

To execute the news digest generation pipeline:

```bash
npm start
```

This single command triggers `ts-node src/index.ts`, executing the full end-to-end workflow:
1. Loads settings via `ConfigService.getInstance()`.
2. Fetches news headlines for each of the 5 categories.
3. Deduplicates articles based on normalized URLs.
4. Regroups unique articles into category sections.
5. Assembles the HTML document using `HTMLBuilder`.
6. Creates the output directory (if necessary) and writes the HTML digest to `output/digest.html`.

You can view the resulting digest by opening `output/digest.html` in any web browser.

---

## Running Tests

Automated testing is implemented with **Jest** and **ts-jest**. All network calls are completely mocked using `jest.mock()` to ensure reliable, instantaneous, and offline-safe test execution.

To run the complete test suite:

```bash
npm test
```

### Test Coverage Highlights
- `tests/ConfigService.test.ts`: Verifies Singleton reference equality (`expect(ConfigService.getInstance()).toBe(ConfigService.getInstance())`) and getter immutability.
- `tests/HTMLBuilder.test.ts`: Tests incremental construction using `addHeader()`, `addSection()`, and `build()`, validating HTML structure (`<h1>`, `<h2>`, `<ul>`, `<li>`, `<a>`).
- `tests/deduplication.test.ts`: Tests URL normalization across protocols, subdomains, and trailing slashes with controlled duplicate datasets.
- `tests/apiClient.test.ts`: Tests network fetching, response mapping, and fallback handling with mocked Axios.
- `tests/main.test.ts`: End-to-end integration test mocking the API client and validating the final generated HTML file against all contractual specifications.

---

## Project Structure

```
.
├── config.json                 # Active application configuration
├── config.json.example         # Template configuration file
├── jest.config.js              # Jest test runner configuration
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
├── src/
│   ├── api/
│   │   └── apiClient.ts        # News API fetcher with error resilience
│   ├── builder/
│   │   └── HTMLBuilder.ts      # HTMLBuilder implementing Builder pattern
│   ├── config/
│   │   └── ConfigService.ts    # ConfigService implementing Singleton pattern
│   ├── types/
│   │   └── article.ts          # Article TypeScript interface
│   ├── utils/
│   │   └── deduplication.ts    # URL normalization and deduplication logic
│   └── index.ts                # Main application orchestrator & CLI entrypoint
├── tests/
│   ├── apiClient.test.ts       # Unit tests for API client with mocked Axios
│   ├── ConfigService.test.ts   # Unit tests verifying Singleton pattern
│   ├── deduplication.test.ts   # Unit tests for URL normalization and deduplication
│   ├── HTMLBuilder.test.ts     # Unit tests verifying HTML Builder pattern
│   └── main.test.ts            # Integration test with mocked API client
└── output/
    └── digest.html             # Generated HTML news digest
```