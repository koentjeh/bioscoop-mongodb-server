//
// ./api/v1/movies.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var neo4jdb = require('../config/neo4j.db');
var mongodb = require('../config/mongo.db');

var Movie = require('../model/neo4jmovie.model');
var MovieMongo = require('../model/movie.model');

//
// Retourneer een lijst met alle films.
// Vorm van de URL: http://hostname:3000/api/v1/movies
//
routes.get('/movies', function(req, res) {
  res.contentType('application/json');

  let movies = [];

  let session = neo4jdb.session();

  let query = `
    MATCH (n:Movie) RETURN n
  `;

  session
    .run(query)
    .then((result) => {
      session.close();

      let mongoMovies = {};

      MovieMongo
        .find({})
        .then((mongoResult) => {

          for (let movie of mongoResult) {

            // string -> object in castIds array
            movie.castIds.forEach((item, index) => {
              movie.castIds[index] = {actor_id: item};
            });

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

//
// Retourneer één specifieke film. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/movies/23
//
routes.get('/movies/:id', function(req, res){
  res.contentType('application/json');

  let session = neo4jdb.session();

  getData = req.params;

  let query = `
    MATCH (n:Movie)
      WHERE n.movie_id = $movie_id
    RETURN n
  `;

  session
    .run(query, {
      movie_id: getData.id
    })
    .then((result) => {
      session.close();

      const record = result.records[0]._fields[0].properties;

      MovieMongo
        .findOne({_id: record['movie_id']})
        .then((movie) => {

          // string -> object in castIds array
          movie.castIds.forEach((item, index) => {
            movie.castIds[index] = {actor_id: item};
          });

          movieEl = new Movie(record['movie_id'], record['title'], record['tagline'], movie);
          res.status(200).json(movieEl);
        });
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
    });
});

//
// Voeg een film toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/movies
//
routes.post('/movies', function(req, res){
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  postData = req.body;

  // object -> string in castIds array
  postData.castIds.forEach((item, index) => {
    postData.castIds[index] = item['actor_id'];
  });

  const movie = new MovieMongo({
    description: postData.description,
    imagePath: postData.imagePath,
    castIds: req.body.castIds
  });

  movie
    .save()
    .then((new_movie) => {

      let query = `
        CREATE (m:Movie { movie_id: {movie_id}, title: {title}, tagline: {tagline} })
        WITH m
        OPTIONAL
          MATCH (a:Actor)
          WHERE a.actor_id IN $castIds
          CREATE UNIQUE (a)-[e:ACTED_IN]->(m)
        RETURN m
      `;

      session
        .run(query, {
          movie_id: new_movie._id.toString(),
          title: postData.title,
          tagline: postData.tagline,
          castIds: postData.castIds
        })
        .then((result) => {
          res.status(200).json(new_movie);
          session.close();
        }).catch((error) => {
          console.log(error)
          res.status(400).json(error);
        });

      }).catch((error) => {
        console.log(error);
        res.status(400).json(error);
      });
});

//
// Wijzig een bestaande film. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: PUT http://hostname:3000/api/v1/movies/23
//
routes.put('/movies/:id', function (req, res) {
  res.contentType('application/json');

  let session = neo4jdb.session();

  postData = req.body;

  // object -> string in castIds array
  req.body.castIds.forEach((item, index) => {
    req.body.castIds[index] = item['actor_id'];
  });

  let query = `
    MATCH (n:Movie)
      WHERE n.movie_id = $movie_id
      SET n.title = $title, n.tagline = $tagline
    WITH n
    OPTIONAL
      MATCH (a:Actor)-[r:ACTED_IN]->(n:Movie {movie_id: $movie_id}) delete r;
      DELETE r
    WITH n,r
    OPTIONAL
      MATCH (a:Actor)
      WHERE a.actor_id IN $castIds
      CREATE UNIQUE (a)-[e:ACTED_IN]->(n)
    RETURN n
  `;

  session
    .run(query, {
      movie_id: postData._id,
      title: postData.title,
      tagline: postData.tagline,
      castIds: req.body.castIds
    })
    .then((result) => {

      MovieMongo
        .findOne({movie_id: postData._id})
        .then((movie) => {

          // string -> object in castIds array
          body.castIds.forEach((item, index) => {
            body.castIds[index] = {actor_id: item};
          });

          movie.description = postData.description;
          movie.imagePath = postData.imagePath;
          movie.castIds = postData.castIds;

          movie.save()
            .then((movie) => {
              res.send(movie)
            }).catch((error) => {
              res.status(400).json(error);
            });
        });
    }).catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});

//
// Verwijder een bestaande film.
// Vorm van de URL: DELETE http://hostname:3000/api/v1/movies/23
//
routes.delete('/movies/:id', function (req, res) {
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  var query = `
    MATCH (n:Movie) WHERE n.movie_id = $movie_id
    DETACH DELETE n
    RETURN n
  `;

  session
    .run(query, {movie_id: req.params.id})
    .then((result) => {
      ActorMongo.findByIdAndRemove(req.params.id)
        .then((movie) => {
          res.status(200).json('remove ok');
        }).catch((error) => {
          res.status(400).json(error);
        });
    }).catch((error) => {
      res.status(400).json(error);
    });
});

module.exports = routes;