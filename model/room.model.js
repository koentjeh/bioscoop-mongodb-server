const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    room: {
        type: Number,
        required: true
    },
    seats: {
    	type: Number,
    	required: true
    }
}, {
    timestamps: true
});


const Room = mongoose.model('rooms', RoomSchema);

// Add a 'dummy' user (every time you require this file!)
// const actor = new Room({
//     room: 1,
//     seats: 344
// }).save();

module.exports = Room;