import axios from 'axios';
import { fetchNewsForCategory } from '../src/api/apiClient';
import { ConfigService } from '../src/config/ConfigService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client (fetchNewsForCategory)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ConfigService.resetInstance();
  });

  afterAll(() => {
    ConfigService.resetInstance();
  });

  test('successfully fetches and maps articles when valid API key is present', async () => {
    // Temporarily mock ConfigService to return a dummy active key
    jest.spyOn(ConfigService.prototype, 'getApiKey').mockReturnValue('test-live-key-12345');

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        articles: [
          {
            title: 'Test Article Title',
            url: 'https://news.example.com/item1',
            source: { name: 'Verified Source' },
            description: 'Test description',
          },
        ],
      },
    });

    const articles = await fetchNewsForCategory('technology');

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(articles.length).toBe(1);
    expect(articles[0].title).toBe('Test Article Title');
    expect(articles[0].url).toBe('https://news.example.com/item1');
    expect(articles[0].source).toBe('Verified Source');
    expect(articles[0].category).toBe('technology');
  });

  test('returns fallback articles when API network request fails', async () => {
    jest.spyOn(ConfigService.prototype, 'getApiKey').mockReturnValue('test-live-key-12345');
    mockedAxios.get.mockRejectedValueOnce(new Error('Network timeout'));

    const articles = await fetchNewsForCategory('business');

    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].category).toBe('business');
    expect(articles[0].url).toBeTruthy();
  });

  test('returns fallback articles without network call when API key is placeholder', async () => {
    jest.spyOn(ConfigService.prototype, 'getApiKey').mockReturnValue('YOUR_API_KEY_HERE');

    const articles = await fetchNewsForCategory('science');

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].category).toBe('science');
  });
});
