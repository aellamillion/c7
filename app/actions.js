'use server';

import * as cheerio from 'cheerio';

export async function parseArticle(url) {
    try {
        // Basic validation
        if (!url) throw new Error('URL is required');

        // Fetch the HTML content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Extract Title
        // Try h1, then og:title, then title tag
        const title = $('h1').first().text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            $('title').text().trim();

        // 2. Extract Date
        // Try various common date selectors/meta tags
        const date = $('meta[property="article:published_time"]').attr('content') ||
            $('meta[name="date"]').attr('content') ||
            $('time').first().attr('datetime') ||
            $('time').first().text().trim() ||
            'Date not found';

        // 3. Extract Content
        // Priority list of selectors common in blogs/articles
        const selectors = [
            'article',
            '.post-content',
            '.entry-content',
            '.content',
            '.post',
            'main',
            '#content'
        ];

        let content = '';

        // Find first matching selector that has substantial content
        for (const selector of selectors) {
            const element = $(selector);
            if (element.length > 0) {
                // Remove known clutter
                element.find('script, style, nav, footer, iframe, .ad, .advertisement, .share-buttons').remove();

                const text = element.text().trim();
                // Simple heuristic: if text is long enough, assume it's the article
                if (text.length > 200) {
                    content = text.replace(/\s+/g, ' ').trim(); // Clean whitespace
                    break;
                }
            }
        }

        // Fallback if no specific container found: try body but it's messy
        if (!content) {
            $('body').find('script, style, nav, footer, header').remove();
            content = $('body').text().trim().replace(/\s+/g, ' ').substring(0, 5000); // Limit length
        }

        return {
            success: true,
            data: {
                date,
                title,
                content
            }
        };

    } catch (error) {
        console.error('Parsing error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
