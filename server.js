var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var account = require('./routes/account.js');

//boiler plate
var app = express();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secret-santa', { useNewUrlParser: true });

app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({
	name: 'local-session',
	keys:['spooky'],
	maxAge: 24 * 60 * 60 * 1000
}))

app.get('/', function(req, res, next){
	res.render('index', {user: req.session.user});
});

app.use('/account', account);

app.use(function (err, req, res, next) {
	return res.send('ERROR : ' + err.message);
})

app.listen(process.env.PORT || 3000, function() {
	console.log('Secret Santa running on ' + (process.env.PORT || 3000));
});