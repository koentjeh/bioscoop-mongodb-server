const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
    	type: String
    },
    imagePath: {
    	type: String
    }
}, {
    timestamps: true
});

const Movie = mongoose.model('movies', MovieSchema);

// Add a 'dummy' user (every time you require this file!)
// const movie = new Movie({
//     name: 'American Pie',
//     description: 'American Pie is een komische tienerfilm uit 1999, geregisseerd door Paul en Chris Weitz. Het was de eerste film van deze twee broers.',
//     imagePath: 'http://www.gstatic.com/tv/thumb/movieposters/23343/p23343_p_v8_af.jpg'
// }).save();

module.exports = Movie;