var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Group = require('../models/group.js');

router.get('/userInfo', function(req, res, next) {
  let user = req.session.user;
  res.json(user);
})

router.post('/groupInfo', function(req, res, next) {
  let groupCode = req.body.groupCode;
  Group.findOne({ groupCode }, function(err, result) {
    res.json(result);
  })
})

router.post('/createGroup', function (req, res, next) {
  let groupCode = req.body.groupCode;
  let username = req.session.user.username;
  let password = req.session.user.password;
  let fullName = req.session.user.firstName + ' ' + req.session.user.lastName;
  var p1 = Group.findOne({ groupCode }).exec();
  p1.then(function (result) {
    if (result != null)
      return Promise.reject({groupCodeTaken: true});
    else
      return result;
  })
  .then(function (result) {
    var g = new Group ({groupCode: groupCode, admin: username, 
      users: [username], usersByName: [fullName]});
    return g.save();
  })
  .then(function(result) {
    return User.findOne({ username, password }).exec();
  })
  .then(function (result) {
    return modifyAndUpdateUser(result, groupCode, true);
  })
  .then(function(result) {
    req.session.user = result;
    res.json(result);
  })
  .catch(function (err) {
    res.json(err);
  })
})

router.post('/joinGroup', function(req, res, next) {
  let groupCode = req.body.groupCode;
  let username = req.session.user.username;
  let password = req.session.user.password;
  let fullName = req.session.user.firstName + ' ' + req.session.user.lastName;
  var p1 = Group.findOne({ groupCode }).exec();
  p1
  .then(function(result) {
    if (result == null)
      return Promise.reject({ groupNonExistent: true })
    else {
      for (var i = 0; i < result.users.length; i++) {
        if (result.users[i] == username)
          return Promise.reject({ groupAlreadyIn: true });
      }
    }
    return result;
  })
  .then(function(result) {
    let n = result.users.length;
    result.users[n] = username;
    result.usersByName[n] = fullName;
    result.markModified('users');
    result.markModified('usersByName');
    return result.save();
  })
  .then(function(result) {
    return User.findOne({ username, password }).exec();
  })
  .then(function(result) {
    return modifyAndUpdateUser(result, groupCode, false);
  })
  .then(function(result) {
    req.session.user = result;
    res.json(result);
  })
  .catch(function (err) {
    res.json(err);
  })
})

router.post('/createAssignments', function(req, res, next) {
  let groupCode = req.body.groupCode;
  Group.findOne({ groupCode }, function (err, group) {
    var users = group.users;
    if (users.length == 1) {
      res.json({group: group, user: req.session.user});
      return;
    }
    var usersByName = group.usersByName;
    var ans = [];
    var visited = new Array(users.length);
    while (ans.length < users.length) {
      let n = ans.length;
      let i = Math.floor(Math.random() * users.length);
      while (visited[i]) {
        i = Math.floor(Math.random() * users.length);
      }
      ans[n] = {username: users[i], fullName: usersByName[i]};
      visited[i] = true;
    }
    group.assignments = ans;
    group.markModified('assignments');
    group.save();
    var info = {group: group, user: req.session.user};
    res.json(info);
  });
})


function modifyAndUpdateUser(result, groupCode, isAdmin) {
	let n = result.groups.length;
	result.groups[n] = { groupCode , isAdmin };
	result.markModified('groups');
	return result.save();
}


module.exports = router;