var mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
	groupCode: { type: String },
	admin: { type: String }, 
	users: [{ type: String }], //array of userNames
  usersByName: [{type: String}],
	assignments: [{ username: String, fullName: String }] //array of assignments (the prev person is their secret santa)
})

module.exports = mongoose.model('Group', groupSchema);