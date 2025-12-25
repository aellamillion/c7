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
                    content = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim(); // Preserve paragraph breaks
                    break;
                }
            }
        }

        // Fallback if no specific container found: try body but it's messy
        if (!content) {
            $('body').find('script, style, nav, footer, header').remove();
            content = $('body').text().trim().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').substring(0, 10000); // Preserve paragraph breaks, higher limit
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


export async function translateArticle(url) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY is not defined in environment variables. Please check .env.local');
        }

        const parseResult = await parseArticle(url);

        if (!parseResult.success) {
            throw new Error(parseResult.error);
        }

        const { title, content } = parseResult.data;
        const textToTranslate = `Title: ${title}\n\nContent: ${content}`.substring(0, 15000); // Limit context window

        const models = [
            "tngtech/tng-r1t-chimera:free",
            "google/gemini-2.0-flash-exp:free",
            "z-ai/glm-4.5-air:free"
        ];

        let response;
        let lastError;

        for (const model of models) {
            try {
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": model,
                        "messages": [
                            {
                                "role": "system",
                                "content": `You are an expert translator and editor. 
Your task is to translate the provided article from English to Russian and format it as a clean, professional Longread.

STRICT RULES:
1. FORMATTING: Use high-quality Markdown. Use # for the main title, ## and ### for subheadings. 
2. STRUCTURE: Detect the logical structure of the text. Reconstruct paragraphs and sections even if the input looks like a blob.
3. CLEANING: Ignore any remaining web noise (like 'click here', random menu items, or navigation fragments).
4. STYLE: Use a professional, engaging Russian style. Avoid literal translations; prioritize natural-sounding prose.
5. NO PLACEHOLDERS: Do not leave any English text unless it's a technical term that should stay in English.
6. OUTPUT ONLY the Russian Markdown content.`
                            },
                            {
                                "role": "user",
                                "content": textToTranslate
                            }
                        ]
                    })
                });

                if (response.status === 429) {
                    console.log(`Rate limited on ${model}, trying next model...`);
                    continue;
                }

                if (!response.ok) {
                    const errText = await response.text();
                    lastError = `OpenRouter API error (${model}): ${response.status} - ${errText}`;
                    continue;
                }

                // If we got here, we have a successful response
                break;
            } catch (err) {
                lastError = err.message;
                continue;
            }
        }

        if (!response || !response.ok) {
            throw new Error(lastError || "All models failed or were rate limited");
        }

        const data = await response.json();
        const translatedText = data.choices[0]?.message?.content || "Translation failed";

        return {
            success: true,
            data: translatedText
        };

    } catch (error) {
        console.error('Translation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
