//
// ./api/v1/actors.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Actor = require('../model/actor.model');

//
// Retourneer een lijst met alle acteurs.
// Vorm van de URL: http://hostname:3000/api/v1/actors
//
routes.get('/actors', function (req, res) {
    res.contentType('application/json');

    Actor.find({})
        .then(function (movies) {
            res.status(200).json(movies);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

//
// Retourneer één specifieke acteur. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/actors/23
//
routes.get('/actors/:id', function (req, res) {
	const _id = req.params.id

	Actor.findById(_id)
		.then((actor) => {
			res.status(200).json(actor);
		}).catch((error) => {
			res.status(401).json(error)
		});
});

//
// Voeg een acteur toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/actors
//
routes.post('/actors', function (req, res) {
	const body = req.body;

    const actor =  new Actor({
        name: body.name,
        imagePath: body.imagePath
    });

    actor.save().then((actor) => {
    	res.send(actor)
    }).catch((error) => {
    	res.status(401).json(error)
    });
});

//
// Wijzig een bestaande acteur. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: PUT http://hostname:3000/api/v1/actors/23
//
routes.put('/actors/:id', function (req, res) {
	const _id = req.params.id

    const actor = Actor.findById(_id)
    	.then((actor) => {
	        const body = req.body;

	        actor.name = body.name;
	        actor.imagePath = body.imagePath;
    
        actor.save().then((actor) => {
        	res.send(actor)
        }).catch((error) => {
        	res.status(401).json(error)
        });
    });
});

//
// Verwijder een bestaande acteur.
// Vorm van de URL: DELETE http://hostname:3000/api/v1/actors/23
//
routes.delete('/actors/:id', function (req, res) {
	const _id = req.params.id;

	Actor.findByIdAndRemove(_id)
	    .then((actor)=>{
	    	res.status(204).json(actor)
	    }).catch((error) => {
	    	res.status(401).json(error)
	    });
});

module.exports = routes;