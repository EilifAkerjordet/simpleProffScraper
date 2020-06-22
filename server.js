const { app } = require('./app');

const server = app.listen(8080, () => {
  const port = server.address().port;
  console.log('listening on port ' + port);
});
