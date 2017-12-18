const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActorSchema = new Schema({
    bio: {
    	type: String
    },
    dateOfBirth: {
    	type: Date
    },
    nationality: {
    	type: String
    },
    imagePath: {
    	type: String
    }
}, {
    timestamps: true
});

const Actor = mongoose.model('actors', ActorSchema);

module.exports = Actor;