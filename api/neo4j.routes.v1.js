//
// ./api/v1/rooms.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var neo4jdb = require('../config/neo4j.db');
var mongodb = require('../config/mongo.db');

var Movie = require('../model/neo4jmovie.model');
var MovieMongo = require('../model/movie.model');

var Actor = require('../model/actor.model');


//Get all movies
routes.get('/neo4j/movies', function(req, res) {
  res.contentType('application/json');

  let movies = [];

  let session = neo4jdb.session();
  let query = `MATCH (n:Movie) RETURN n LIMIT 25`;

  session
    .run(query)
    .then((result) => {
      session.close();

      let mongoMovies = {};

      MovieMongo
        .find({})
        .then((mongoResult) => {

          for (let movie of mongoResult) {
            mongoMovies[movie._id] = movie;
          }

          result.records.forEach((records) => {
            let record = records._fields[0].properties;
            movies.push(new Movie(record['movie_id'], record['title'], record['tagline'], mongoMovies[record['movie_id']]));
          });

          res.status(200).json(movies);
        })
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
    });
});

//Get one movie
routes.get('/neo4j/movies/:movie_id', function(req, res){
  res.contentType('application/json');

  let session = neo4jdb.session();

  let query = `
    MATCH (n:Movie) WHERE n.movie_id = $movie_id RETURN n
  `;

  session
    .run(query, {movie_id: req.params.movie_id})
    .then((result) => {
      session.close();

      const record = result.records[0]._fields[0].properties;

      MovieMongo
        .findOne({_id: record['movie_id']})
        .then((movie) => {
          movieEl = new Movie(record['movie_id'], record['title'], record['tagline'], movie);
          res.status(200).json(movieEl);
        });
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
    });
});

//Create movie
routes.post('/neo4j/movies', function(req, res){
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  movie = req.body;

  const movieDocument = new MovieMongo({
    description: movie.description,
    imagePath: movie.imagePath
  });

  //Save details in Mongo database, then use document ID to save it in neo4j
  movieDocument
    .save()
    .then((new_movie) => {
    
      var query = `
        CREATE (m:Movie { movie_id: {movie_id}, title: {title}, tagline: {tagline} })
      `;

      session.run(query, {
        movie_id: new_movie._id.toString(),
        title: movie.title,
        tagline: movie.tagline
      })
      .then((result) => {
        res.status(201).json(new_movie);

        session.close();
      }).catch((error) => {
        res.status(401).json(error);
      });
    });
});









//
// Retourneer een lijst met alle zalen.
// Vorm van de URL: http://hostname:3000/api/v1/rooms
//
routes.get('/neo4j/movies/relateable', function (req, res) {
    res.contentType('application/json');

    session
        .run('MATCH(n:Movie) RETURN n LIMIT 25')
        .then(function(result) {
            result.records.forEach(function(record) {
                console.log(record._fields);
            });

            session.close();
            driver.close();
        })
        .catch(function(error) {
            console.log(error);
            driver.close();
        });
        // .subscribe({
        //     onNext: function(record) {
        //         return record;
        //         session.close();
        //         driver.close();
        //         console.log(record);
        //     },
        //     onCompleted: function() {


        //     },
        //     onError: function(error) {
        //         console.log(error);
        //     }
        // })
});

module.exports = routes;