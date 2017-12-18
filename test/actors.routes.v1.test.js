//
// Tests voor versie 1 van de API.
//
// Referentie: zie http://chaijs.com/api/bdd/#members-section
//
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var chould = chai.should();
var neo4jdb = require('../config/neo4j.db');

var Actor = require('../model/actor.model');
var Actor2 = require('../model/neo4jactor.model');

chai.use(chaiHttp);

describe('Actor API v1', () => {

  // Construct part of actor from MongoDB
  const mongoActor = new Actor({
    bio: "Willard Christopher Smith Jr. is een Amerikaans acteur en rapper, die vroeger bekend was als The Fresh Prince.",
    dateOfBirth: "1997-08-18T00:00:00.000Z",
    nationality: "USA",
    imagePath: "https://images-na.ssl-images-amazon.com/images/M/MV5BNTczMzk1MjU1MV5BMl5BanBnXkFtZTcwNDk2MzAyMg@@._V1_UY317_CR2,0,214,317_AL_.jpg"
  });

  // Combine MongoDB actor with Neo4j actor
  const actor = new Actor2(
    mongoActor._id.toString(),
    "Will Smith",
    mongoActor
  );

  it('returns all existing actors on GET /api/v1/actors', (done) => {
    chai
      .request(server)
      .get('/api/v1/actors')
      .end(function(err, res) {

        // Testing result here
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        done();
      });
  });

  it('return one specific actor /api/v1/actors/:id', (done) => {
    let session = neo4jdb.session();

    mongoActor
      .save()
      .then((new_actor) => {
        session
          .run(`CREATE (a:Actor { actor_id: {actor_id}, name: {name} })`, {
            actor_id: new_actor._id.toString(),
            name: actor.name
          })
          .then((result) => {
            session.close();
            chai
              .request(server)
              .get('/api/v1/actors/' + actor._id)
              .end((err, res) => {

                // Testing result here
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('_id').eql(actor._id.toString());
                res.body.should.have.property('name');
                res.body.should.have.property('bio');
                res.body.should.have.property('dateOfBirth');
                res.body.should.have.property('nationality');
                res.body.should.have.property('imagePath');
                done();
              });
          });
        });
  });

  it('add an actor on POST /api/v1/actors', (done) => {
    let session = neo4jdb.session();

    mongoActor
      .save()
      .then((new_actor) => {
        session
          .run(`CREATE (a:Actor { actor_id: {actor_id}, name: {name} })`, {
            actor_id: new_actor._id.toString(),
            name: actor.name
          })
          .then((result) => {
            session.close();
            chai
              .request(server)
              .post('/api/v1/actors')
              .send(actor)
              .end((err,res) => {

                // Testing result here
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.should.have.property('_id').eql(actor._id.toString());
                res.body.should.have.property('name');
                res.body.should.have.property('bio');
                res.body.should.have.property('dateOfBirth');
                res.body.should.have.property('nationality');
                res.body.should.have.property('imagePath');
                done();
              });
          });
      });
  });

  it('edits an actor on PUT /api/v1/actors/:id', (done) => {
    let session = neo4jdb.session();

    const newActor = {
      name: "Will Smith",
      bio: "Willard Christopher Smith Jr. is een Amerikaans acteur en rapper, die vroeger bekend was als The Fresh Prince.",
      dateOfBirth: "1997-08-18T00:00:00.000Z",
      nationality: "USA",
      imagePath: "https://images-na.ssl-images-amazon.com/images/M/MV5BNTczMzk1MjU1MV5BMl5BanBnXkFtZTcwNDk2MzAyMg@@._V1_UY317_CR2,0,214,317_AL_.jpg"
    };

    mongoActor
      .save()
      .then((new_actor) => {
        session
          .run(`CREATE (a:Actor { actor_id: {actor_id}, name: {name} })`, {
            actor_id: new_actor._id.toString(),
            name: actor.name
          })
          .then((result) => {
            session.close();
            chai
              .request(server)
              .put('/api/v1/actors/' + actor._id)
              .send(newActor)
              .end((err, res) => {

                // Testing result here
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.should.have.property('bio');
                res.body.should.have.property('dateOfBirth');
                res.body.should.have.property('nationality');
                res.body.should.have.property('imagePath');
                done();
              });
          });
      });
  });

  it('deletes an actor on DELETE /api/v1/actors/:id', (done) => {
    let session = neo4jdb.session();

    mongoActor
      .save()
      .then((new_actor) => {
        session
          .run(`CREATE (a:Actor { actor_id: {actor_id}, name: {name} })`, {
            actor_id: new_actor._id.toString(),
            name: actor.name
          })
          .then((result) => {
            session.close();
            chai
              .request(server)
              .delete('/api/v1/actors/' + actor._id)
              .send(actor)
              .end((err, res) => {

                // Testing result here
                res.should.have.status(200);
                res.should.be.json;
                done();
              });
          });
      });
  });
});