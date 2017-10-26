var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var pollSchema = new Schema({
    userId: { type: 'String', required: true },
    title: { type: 'String', required: true },
    options: { type: 'Array', required: true },
    cuid: { type: 'String', required: true },
    dateAdded: { type: 'Date', default: Date.now, required: true },
});

module.exports = mongoose.model('Poll', pollSchema);
