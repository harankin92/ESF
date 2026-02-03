const http = require('http');

const data = JSON.stringify({ priority: 'High' });

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/requests/1/priority',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
        // Note: No Authorization header, so we expect 401 or 403, usually JSON or text.
        // If we get HTML 404 or index.html, that's the issue.
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY START:', body.substring(0, 200));
        try {
            JSON.parse(body);
            console.log('Body is VALID JSON');
        } catch (e) {
            console.log('Body is INVALID JSON');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
