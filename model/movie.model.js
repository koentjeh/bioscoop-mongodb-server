const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
	title: {
		type: String
	},
    description: {
    	type: String
    },
    imagePath: {
    	type: String
    },
    castIds: [{
        type: String
    }]
}, {
    timestamps: true
});

const Movie = mongoose.model('movies', MovieSchema);

module.exports = Movie;