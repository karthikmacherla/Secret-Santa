var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	firstName: { type: String }, 
	lastName: { type: String }, 
	username: { type: String }, 
	password: { type: String },
	groups: [{ groupCode: String, isAdmin: Boolean}]//obj is an array of groups
	// containing whether admin or not
})

module.exports = mongoose.model('User', userSchema);