//
// ./api/v1/actors.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var neo4jdb = require('../config/neo4j.db');
var mongodb = require('../config/mongo.db');

var Actor = require('../model/neo4jactor.model');
var ActorMongo = require('../model/actor.model');

//
// Retourneer een lijst met alle acteurs.
// Vorm van de URL: http://hostname:3000/api/v1/actors
//
routes.get('/actors', function(req, res) {
  res.contentType('application/json');

  let actors = [];

  let session = neo4jdb.session();
  let query = `MATCH (a:Actor) RETURN a`;

  session
    .run(query)
    .then((result) => {
      session.close();

      let mongoActors = {};

      ActorMongo
        .find({})
        .then((mongoResult) => {

          for (let actor of mongoResult) {
            mongoActors[actor._id] = actor;
          }

          result.records.forEach((records) => {
            let record = records._fields[0].properties;
            actors.push(new Actor(record['actor_id'], record['name'], mongoActors[record['actor_id']]));
          });

          res.status(200).json(actors);
        });
    });
});

//
// Retourneer één specifieke acteur. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/actors/23
//
routes.get('/actors/:actor_id', function(req, res){
  res.contentType('application/json');

  let session = neo4jdb.session();

  let query = `
    MATCH (a:Actor) WHERE a.actor_id = $actor_id RETURN a
  `;

  session
    .run(query, {actor_id: req.params.actor_id})
    .then((result) => {
      session.close();

      const record = result.records[0]._fields[0].properties;

      ActorMongo
        .findOne({_id: record['actor_id']})
        .then((actor) => {
          actorEl = new Actor(record['actor_id'], record['name'], actor);
          res.status(200).json(actorEl);
        });
    });
});

//
// Voeg een acteur toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/actors
//
routes.post('/actors', function(req, res){
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  actor = req.body;

  const actorDocument = new ActorMongo({
    bio: actor.bio,
    dateOfBirth: actor.dateOfBirth,
    nationality: actor.nationality,
    imagePath: actor.imagePath
  });

  actorDocument
    .save()
    .then((new_actor) => {
    
      var query = `
        CREATE (a:Actor { actor_id: {actor_id}, name: {name} })
      `;

      session
        .run(query, {
          actor_id: new_actor._id.toString(),
          name: actor.name
        })
        .then((result) => {
          session.close();
          res.status(200).json(actor);
        }).catch((error) => {
          res.status(400).json(error);
        });
      }).catch((error) => {
        res.status(400).json(error);
      });
});

//
// Wijzig een bestaande acteur. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: PUT http://hostname:3000/api/v1/actors/23
//
routes.put('/actors/:id', function (req, res) {
  res.contentType('application/json');

  let session = neo4jdb.session();

  var query = `
    MATCH (a:Actor) WHERE a.actor_id = $actor_id
    SET a.name = $name
    RETURN a
  `;

  session
    .run(query, {actor_id: req.params.id, name: req.body.name})
    .then((result) => {

      const record = result.records[0]._fields[0].properties;

      const actor = ActorMongo
        .findById(record['actor_id'])
        .then((actor) => {

          const body = req.body;

          actor.bio = body.bio;
          actor.dateOfBirth = body.dateOfBirth;
          actor.nationality = body.nationality;
          actor.imagePath = body.imagePath;

          actor.save()
            .then((actor) => {
              res.status(200).json(actor);
            }).catch((error) => {
              res.status(400).json(error);
            });
        });
    }).catch((error) => {
      res.status(400).json(error);
    });
});

//
// Verwijder een bestaande acteur.
// Vorm van de URL: DELETE http://hostname:3000/api/v1/actors/23
//
routes.delete('/actors/:id', function (req, res) {
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  var query = `
    MATCH (a:Actor) WHERE a.actor_id = $actor_id
    DETACH DELETE a
    RETURN a
  `;

  session
    .run(query, {actor_id: req.params.id})
    .then((result) => {
      ActorMongo.findByIdAndRemove(req.params.id)
        .then((actor) => {
          res.status(200).json('remove ok');
        }).catch((error) => {
          res.status(400).json(error);
        });
    }).catch((error) => {
      res.status(400).json(error);
    });
});

module.exports = routes;