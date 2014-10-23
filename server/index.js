var express = require('express'),
    cons    = require('consolidate'),
    hogan   = require('hogan.js');

app = express();

app.set('views', './src');
app.engine('html', cons.hogan);

var baseUrl = "/";

['assets', 'locales', 'index.liquid.html', 'manifest.json'].map(function(path) {
  app.use(baseUrl + path, express.static('./dist/' + path, {
    index: false,
    dotfiles: 'ignore',
    redirect: false
  }));
});

var env = {
  ship: {
    id: process.env.HULL_APP_ID,
    source_url: baseUrl
  },
  org: {
    namespace: process.env.HULL_ORG_NAMESPACE,
    domain: process.env.HULL_ORG_DOMAIN
  }
};

function index(req, res) {
  res.render('index.html', env);
}

if (baseUrl !== "/") {
  app.get("/", function(req, res) {
    res.redirect(302, baseUrl);
  });
}
app.get(baseUrl, index);
app.get(baseUrl + 'index.html', index);


var port = process.env.PORT || 5000;
app.listen(port);

console.log("App listening on port ", port);
