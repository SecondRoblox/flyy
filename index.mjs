import express from 'express';
import request from 'request';
import path from 'path';

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
    request(url)
        .on('response', (response) => {
            // Copy headers and status code
            res.set(response.headers);
            res.status(response.statusCode);
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error fetching the URL.');
        })
        .pipe(res);
});

// Define the port to listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
