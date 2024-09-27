import express from 'express';
import request from 'request';

const app = express();

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Proxy server running. Use /proxy?url=<URL> to access a site.');
});

// Proxy route
app.get('/proxy', (req, res) => {
    const url = req.query.url;

    // Validate the URL
    if (!url) {
        return res.status(400).send('URL is required.');
    }

    // Forward the request to the specified URL
    request(url)
        .on('response', (response) => {
            // Copy headers from the response
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
