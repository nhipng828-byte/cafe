const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.get('http://localhost:5000/api/pos/tables');
        console.log("API TABLES:", res.data.length);
    } catch (err) {
        console.error("API ERROR:", err.message);
    }
}

testApi();
