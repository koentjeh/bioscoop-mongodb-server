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

// Add a 'dummy' user (every time you require this file!)
// const actor = new Actor({
//     name: 'Isabela Moner',
//     bio: 'Isabela Moner (born Isabela Yolanda Moner on July 10, 2001) is an American actress, voice actress, singer, songwriter, dancer and ukulele player. Moner was born in Cleveland, Ohio. She was born to Katherine Moner, of Peruvian descent, who was born in Lima, Peru and to Patrick Moner, of American descent, who was born in Louisiana. She is the middle child of her family and has two other brothers, Gyovanni, which is her younger brother and Jared, which is her older brother. She had her Broadway debut at the age of 10 in a production of Evita.j',
//     dateOfBirth: new Date("2001-7-10"),
//     nationality: 'USA',
//     imagePath: 'https://i.imgur.com/tfAnWLj.jpg'
// }).save();
// const actor = new Actor({
//     name: 'Emma Watson',
//     bio: 'Emma Charlotte Duerre Watson was born in Paris, France, to English parents, Jacqueline Luesby and Chris Watson, both lawyers. She moved to Oxfordshire when she was five, where she attended the Dragon School. From the age of six, Emma knew that she wanted to be an actress and, for a number of years, she trained at the Oxford branch of Stagecoach Theatre Arts, a part-time theatre school where she studied singing, dancing and acting. By the age of ten, she had performed and taken the lead in various Stagecoach productions and school plays.',
//     dateOfBirth: new Date("1990-5-15"),
//     nationality: 'USA',
//     imagePath: 'https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/42/hbz-emma-watson-hair-2015-gettyimages-485370042.jpg'
// }).save();

module.exports = Actor;