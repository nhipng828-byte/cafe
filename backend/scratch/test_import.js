const http = require('http');

const body = JSON.stringify({
  maNV: 1,
  maNCC: "Test Supplier",
  chiTiet: [{
    maNVL: 95,
    soLuong: 2,
    donGia: 120000,
    dvn: "kg",
    quyDoi: 1000
  }]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/inventory/import',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': body.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Result:', data);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(body);
req.end();
