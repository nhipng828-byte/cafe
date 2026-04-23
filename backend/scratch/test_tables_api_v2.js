const http = require('http');

http.get('http://localhost:5000/api/pos/tables', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("API TABLES COUNT:", json.length);
        } catch (e) {
            console.log("DATA:", data);
        }
    });
}).on('error', (err) => {
    console.error("ERROR:", err.message);
});
