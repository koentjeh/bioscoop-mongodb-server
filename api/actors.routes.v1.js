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
        })
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
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
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
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


      // relationship movie -> actor (castmember)
      // MATCH (n:Movie {movie_id: '5a3161c8b9a76034804a2c9f'}),(d:Actor {actor_id: '5a316207b9a76034804a2ca0'}) CREATE(n)-[r:ACTED_IN]->(d) RETURN r,n,d


// MATCH (m:Movie), (a:Actor)
// WITH COLLECT(DISTINCT m) AS n1, COLLECT(DISTINCT a) AS n2
// WHERE LENGTH(n1) = LENGTH(n2)
// FOREACH (i IN RANGE(0, LENGTH(n1) - 1) |
//   FOREACH (node IN [n1[i]] |
//     FOREACH (othernode IN [n2[i]] |
//       MERGE (node)-[:ACTED_IN]-(othernode)
//     )
//   )
// )

// WITH [{name: "Event 1", timetree: {day: 1, month: 1, year: 2014}}, 
//       {name: "Event 2", timetree: {day: 2, month: 1, year: 2014}}] AS events
// UNWIND events AS event
// CREATE (e:Event {name: event.name})
// WITH e, event.timetree AS timetree
// MATCH (year:Year {year: timetree.year }), 
//       (year)-[:HAS_MONTH]->(month {month: timetree.month }),
//       (month)-[:HAS_DAY]->(day {day: timetree.day })
// CREATE (e)-[:HAPPENED_ON]->(day)




      session
        .run(query, {
          actor_id: new_actor._id.toString(),
          name: actor.name
        })
        .then((result) => {
          res.status(200).json(new_actor);

          session.close();
        }).catch((error) => {
          res.status(400).json(error);
        });
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
              res.send(actor)
            }).catch((error) => {
              res.status(400).json(error);
            })
        });
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