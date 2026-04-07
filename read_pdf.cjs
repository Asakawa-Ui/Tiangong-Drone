const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('prd_out/src/prd_out.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});
