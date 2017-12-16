//
// ./api/v1/rooms.routes.v1.js
//
var express = require('express');
var routes = express.Router();
var neo4jdb = require('../config/neo4j.db');
var mongodb = require('../config/mongo.db');

var Room = require('../model/neo4jroom.model');
var RoomMongo = require('../model/room.model');

//
// Retourneer een lijst met alle zalen.
// Vorm van de URL: http://hostname:3000/api/v1/rooms
//
routes.get('/rooms', function(req, res) {
  res.contentType('application/json');

  let rooms = [];

  let session = neo4jdb.session();

  let query = `
    MATCH (r:Room) RETURN r
  `;

  session
    .run(query)
    .then((result) => {
      session.close();

      let mongoRooms = {};

      RoomMongo
        .find({})
        .then((mongoResult) => {

          for (let room of mongoResult) {
            mongoRooms[room._id] = room;
          }

          result.records.forEach((records) => {
            let record = records._fields[0].properties;
            rooms.push(new Room(record['room_id'], record['room'], mongoMovies[record['room_id']]));
          });

          res.status(200).json(rooms);
        })
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
    });
});

//
// Retourneer één specifieke zaal. Hier maken we gebruik van URL parameters.
// Vorm van de URL: http://hostname:3000/api/v1/rooms/23
//
routes.get('/rooms/:id', function(req, res){
  res.contentType('application/json');

  let session = neo4jdb.session();

  getData = req.params;

  let query = `
    MATCH (r:Room)
      WHERE r.room_id = $room_id
    RETURN r
  `;

  session
    .run(query, {
      room_id: req.params.id
    })
    .then((result) => {
      session.close();

      const record = result.records[0]._fields[0].properties;

      RoomMongo
        .findOne({_id: record['room_id']})
        .then((room) => {

          roomEl = new Room(record['room_id'], record['room'], room);
          res.status(200).json(roomEl);
        });
    })
    .catch((error) => {
        res.status(400).json(error);
        session.close();
    });
});

//
// Voeg een zaal toe. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: POST http://hostname:3000/api/v1/rooms
//
routes.post('/rooms', function(req, res){
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  req.body;

  // object -> string in movieIds array
  req.body.castIds.forEach((item, index) => {
    req.body.castIds[index] = item['actor_id'];
  });

  const room = new Room({
    seats: body.seats
  });

  room
    .save()
    .then((new_room) => {
      let query = `
        CREATE (r:Room { room_id: {room_id}, room: {room}})
        WITH r
        OPTIONAL
          MATCH (m:Movie)
          WHERE m.movie_id IN $movieIds
          CREATE UNIQUE (m)-[e:AVAILABLE_IN]->(r)
        RETURN r
      `;

      session
        .run(query, {
          room_id: new_room._id.toString(),
          room: req.body.room
        })
        .then((result) => {
          res.status(200).json(result);
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
// Wijzig een bestaande zaal. De nieuwe info wordt gestuurd via de body van de request message.
// Vorm van de URL: PUT http://hostname:3000/api/v1/rooms/23
//
routes.put('/rooms/:id', function (req, res) {
  res.contentType('application/json');

  let session = neo4jdb.session();

  postData = req.body;

  // object -> string in castIds array
  req.body.castIds.forEach((item, index) => {
    req.body.castIds[index] = item['actor_id'];
  });

  let query = `
    MATCH (r:Room)
      WHERE r.room_id = $room_id
      SET r.room = $room
    WITH r
    OPTIONAL
      MATCH (m:Movie)-[r:AVAILABLE_IN]->(r:Room {room_id: $room_id}) delete r;
      DELETE r
    WITH n,r
    OPTIONAL
      MATCH (m:Movie)
      WHERE m.movie_id IN $movieIds
      CREATE UNIQUE (m)-[e:AVAILABLE_IN]->(r)
    RETURN r
  `;

  session
    .run(query, {
      room_id: postData._id,
      room: postData.room,
      movieIds: req.body.movieIds
    })
    .then((result) => {

      MovieMongo
        .findOne({room_id: postData._id})
        .then((room) => {

          // string -> object in castIds array
          body.castIds.forEach((item, index) => {
            body.castIds[index] = {actor_id: item};
          });

          room.seats = postData.seats;

          room.save()
            .then((room) => {
              res.send(room)
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
// Verwijder een bestaande zaal.
// Vorm van de URL: DELETE http://hostname:3000/api/v1/rooms/23
//
routes.delete('/movies/:id', function (req, res) {
  res.contentType('application/json');
  
  let session = neo4jdb.session();

  var query = `
    MATCH (r:Room) WHERE r.room_id = $room_id
    DETACH DELETE r
    RETURN r
  `;

  session
    .run(query, {room_id: req.params.id})
    .then((result) => {
      RoomMongo.findByIdAndRemove(req.params.id)
        .then((room) => {
          res.status(200).json('remove ok');
        }).catch((error) => {
          res.status(400).json(error);
        });
    }).catch((error) => {
      res.status(400).json(error);
    });
});

module.exports = routes;