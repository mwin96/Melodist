const express = require('express');

const app = express();
const {readFile} = require('fs').promises;


app.use(express.static(__dirname + '/public')); 

app.listen(process.env.PORT || 3000, () => console.log(`It be at http://localhost:3000`))