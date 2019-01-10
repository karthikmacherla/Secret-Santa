var mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
	groupName: { type: String },
	groupCode: { type: String },
	admin: { type: String }, 
	users: { type: Object }, //array of userNames
	assignments: [{ type: String }] // 2d array of userNames
})

module.exports = mongoose.model('Group', groupSchema);