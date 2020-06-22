const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const getDataProff = require('./server/get-proff-data').getUriData;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use( express.static( __dirname + '/client' ));

app.get('/', (req, res) => {
  res.sendFile( path.join( __dirname, 'client', 'index.html' ));
});

app.post('/api/searchresults', async(req, res) => {
  console.log('incoming request...');
  const searchResult = await getDataProff(`${req.body.url}&view=json`);
  console.log('data processed...');
  res.json(searchResult);
  console.log('response sent...');
  res.end();
});

module.exports.app = app;
