var express = require('express'),
    cons    = require('consolidate'),
    hogan   = require('hogan.js');

app = express();

app.set('views', './src');
app.engine('html', cons.hogan);

['assets', 'templates', 'locales', 'index.liquid.html', 'manifest.json'].map(function(path) {
  app.use("/" + path, express.static('./dist/' + path, {
    index: false,
    dotfiles: 'ignore',
    redirect: false
  }));
});

var env = {
  ship: { id: process.env.HULL_APP_ID },
  org: {
    namespace: process.env.HULL_ORG_NAMESPACE,
    domain: process.env.HULL_ORG_DOMAIN
  }
};

function index(req, res) {
  res.render('index.html', env);
}

app.get('/', index);
app.get('/index.html', index);


var port = process.env.PORT || 5000;
app.listen(port);

console.log("App listening on port ", port);
