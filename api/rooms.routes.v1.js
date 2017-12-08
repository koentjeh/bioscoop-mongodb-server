//
// ./api/v1/rooms.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Room = require('../model/room.model');

//
// Retourneer een lijst met alle zalen.
// Vorm van de URL: http://hostname:3000/api/v1/rooms
//
routes.get('/rooms', function (req, res) {
    res.contentType('application/json');

    Room.find({})
        .then(function (movies) {
            res.status(200).json(movies);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

//
// Retourneer één specifieke zaal. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/rooms/23
//
routes.get('/rooms/:id', function (req, res) {
	const _id = req.params.id

	Room.findById(_id)
		.then((room) => {
			res.status(200).json(room);
		}).catch((error) => {
			res.status(401).json(error)
		});
});

//
// Voeg een zaal toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/rooms
//
routes.post('/rooms', function (req, res) {
	const body = req.body;

    const room =  new Room({
        room: body.room,
        seats: body.seats
    });

    room.save().then((room) => {
    	res.send(room)
    }).catch((error) => {
    	res.status(401).json(error)
    });
});

//
// Wijzig een bestaande zaal. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: PUT http://hostname:3000/api/v1/rooms/23
//
routes.put('/rooms/:id', function (req, res) {
	const _id = req.params.id

    const room = Room.findById(_id)
    	.then((room) => {
	        const body = req.body;

	        room.room = body.room;
	        room.seats = body.seats;
    
        room.save().then((room) => {
        	res.send(room)
        }).catch((error) => {
        	res.status(401).json(error)
        });
    });
});

//
// Verwijder een bestaande zaal.
// Vorm van de URL: DELETE http://hostname:3000/api/v1/rooms/23
//
routes.delete('/rooms/:id', function (req, res) {
	const _id = req.params.id;

	Room.findByIdAndRemove(_id)
	    .then((room)=>{
	    	res.status(204).json(room)
	    }).catch((error) => {
	    	res.status(401).json(error)
	    });
});

module.exports = routes;