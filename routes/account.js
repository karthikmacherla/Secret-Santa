var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

//GETS
router.get('/login', function(req, res, next) {
	res.render('loginrevised', {invalidUserName: false}); 
});

router.get('/signup', function(req, res, next) {
	res.render('signuprevised');
})

router.get('/logout', function (req, res, next) {
	req.session.user = false;
	res.redirect('/');
})

//POSTS
router.post('/login', function(req, res, next) {
	//if in database -> redirect to main page
	//res.redirect('user-profile')
	var username = req.body.username;
	var password = req.body.password;
	User.findOne({ username, password }, function (err, result) {
		if (err || result == null)
			res.render('loginrevised', {invalidUserName: true});
		else {
			req.session.user = result;
			res.redirect('/');
		}
	})
})


router.post('/signup', function(req, res, next) {
	//get user and pass and keycode
	//add the user to the group schema
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var username = req.body.username;
	var password = req.body.password;
	var groups = [];

	var u = new User({ firstName, lastName, username, 
		password, groups});
	u.save(function (err, result) {
		if (err)
			next(err)
		else
			res.redirect('/account/login');
	});
})


module.exports = router;