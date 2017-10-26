var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var pollSchema = new Schema({
	twitter: {
		id: String,
		displayName: String,
		username: String,
		email: String
	}
});

module.exports = mongoose.model('User', pollSchema);
