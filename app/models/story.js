var m = require('mongoose');

var Schema = m.Schema;

var storySchema = new Schema({

    creator: {type: Schema.Types.ObjectId, ref:'User'},
    content: String,
    created: {type: Date, default: Date.now}
});

module.exports = m.model('Story', storySchema);