import express from 'express';
import request from 'request';
import cheerio from 'cheerio';

const app = express();

// Serve static HTML for the proxy interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Proxy Server</title>
        </head>
        <body>
            <h1>Proxy Server</h1>
            <form action="/fetch" method="GET">
                <input type="text" name="url" placeholder="Enter URL to fetch" required>
                <button type="submit">Fetch</button>
            </form>
        </body>
        </html>
    `);
});

// Proxy route to fetch content
app.get('/fetch', (req, res) => {
    const url = req.query.url;

    // Validate the URL
    if (!url) {
        return res.status(400).send('URL is required.');
    }

    // Forward the request to the specified URL
    request(url, (error, response, body) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error fetching the URL.');
        }

        // Load the HTML into Cheerio for manipulation
        const $ = cheerio.load(body);

        // Rewrite image URLs to go through the proxy
        $('img').each((_, img) => {
            const src = $(img).attr('src');
            if (src) {
                $(img).attr('src', `/fetch?url=${encodeURIComponent(src)}`);
            }
        });

        // Rewrite link URLs (for CSS/JS)
        $('link[rel="stylesheet"], script').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('href');
            if (src) {
                const newSrc = `/fetch?url=${encodeURIComponent(src)}`;
                if ($(el).is('link')) {
                    $(el).attr('href', newSrc);
                } else {
                    $(el).attr('src', newSrc);
                }
            }
        });

        // Set headers and send the modified HTML
        res.set(response.headers);
        res.status(response.statusCode).send($.html());
    });
});

// Directly proxy image requests
app.get('/images/*', (req, res) => {
    const imageUrl = decodeURIComponent(req.path.slice(7)); // Remove '/images/' prefix
    request(imageUrl).pipe(res);
});

// Define the port to listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
