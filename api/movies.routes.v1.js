//
// ./api/v1/movies.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var mongodb = require('../config/mongo.db');
var Movie = require('../model/movie.model');

//
// Retourneer een lijst met alle films.
// Vorm van de URL: http://hostname:3000/api/v1/movies
//
routes.get('/movies', function (req, res) {
    res.contentType('application/json');

    Movie.find({})
        .then(function (movies) {
            res.status(200).json(movies);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
});

//
// Retourneer één specifieke flm. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/movies/23
//
routes.get('/movies/:id', function (req, res) {
	const _id = req.params.id

	Movie.findById(_id)
		.then((movie) => {
			res.status(200).json(movie);
		}).catch((error) => {
			res.status(401).json(error)
		});
});

//
// Voeg een film toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/movies
//
routes.post('/movies', function (req, res) {
	const body = req.body;

    const movie =  new Movie({
        name: body.name,
        description: body.description,
        imagePath: body.imagePath
    });

    movie.save().then((film) => {
    	res.send(film)
    }).catch((error) => {
    	res.status(401).json(error)
    });
});

//
// Wijzig een bestaande film. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: PUT http://hostname:3000/api/v1/movies/23
//
routes.put('/movies/:id', function (req, res) {
	const _id = req.params.id

    const movie = Movie.findById(_id)
    	.then((movie) => {
	        const body = req.body;

	        movie.name = body.name;
	        movie.description = body.description;
	        movie.imagePath = body.imagePath;
    
        movie.save().then((movie) => {
        	res.send(movie)
        }).catch((error) => {
        	res.status(401).json(error)
        });
    });
});

//
// Verwijder een bestaande film.
// Vorm van de URL: DELETE http://hostname:3000/api/v1/movies/23
//
routes.delete('/movies/:id', function (req, res) {
	const _id = req.params.id;

	Movie.findByIdAndRemove(_id)
	    .then((category)=>{
	    	res.status(204).json(category)
	    }).catch((error) => {
	    	res.status(401).json(error)
	    });
});

module.exports = routes;