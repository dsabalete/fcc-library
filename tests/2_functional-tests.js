/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const Book = require('../models/Book');

// const demoBook = { title: 'Test Book', comments: [] };


suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test.skip('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('POST /api/books with title => create book object/expect book object', function () {

    test('Test POST /api/books with title', function (done) {
      chai.request(server)
        .post('/api/books')
        .send({ title: 'Test Book' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title', 'Books in array should contain title');
          assert.property(res.body, '_id', 'Books in array should contain _id');
          assert.equal(res.body.title, 'Test Book');
          done();
        });
    });

    test('Test POST /api/books with no title given', function (done) {
      chai.request(server)
        .post('/api/books')
        .send({ title: '' })
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'missing required field title');
          done();
        });
    });

    test('Test POST /api/books without anything', function (done) {
      chai.request(server)
        .post('/api/books')
        .send()
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'missing required field title');
          done();
        });
    });

  });

  suite('POST /api/books/[id] => add comment/expect book object with id', function () {

    test('Test POST /api/books/[id] with comment', function (done) {
      new Book({ title: 'Test Book', comments: [] })
        .save()
        .then((book) => {
          const bookId = book._id.toString();
          chai.request(server)
            .post(`/api/books/${bookId}`)
            .send({ comment: 'Test Comment' })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.property(res.body, 'comments', 'Book should contain comments');
              assert.equal(res.body._id, bookId);
              assert.equal(res.body.title, 'Test Book');
              assert.include(res.body.comments, 'Test Comment');
              done();
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });

    test('Test POST /api/books/[id] without comment field', function (done) {
      new Book({ title: 'Test Book', comments: [] })
        .save()
        .then((book) => {
          chai.request(server)
            .post(`/api/books/${book._id.toString()}`)
            .send({ comment: '' })
            .end(function (err, res) {
              assert.equal(res.status, 400);
              assert.equal(res.text, 'missing required field comment');
              done();
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });

    test('Test POST /api/books/[id] with comment, id not in db', function (done) {
      chai.request(server)
        .post('/api/books/invalidid')
        .send({ comment: 'Test Comment' })
        .end(function (err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });
  });

  suite('GET /api/books/[id] => book object with [id]', function () {

    test('Test GET /api/books/[id] with id not in db', function (done) {
      chai.request(server)
        .get('/api/books/invalidid')
        .end(function (err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

    test('Test GET /api/books/[id] with valid id in db', function (done) {
      new Book({ title: 'Test Book', comments: [] })
        .save()
        .then((book) => {
          chai.request(server)
            .get(`/api/books/${book._id.toString()}`)
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.property(res.body, 'comments', 'Book should contain comments');
              assert.equal(res.body._id, book._id.toString());
              assert.equal(res.body.title, 'Test Book');
              assert.deepEqual(res.body.comments, []);
              done();
            });
        })
        .catch((error) => {
          console.log(err);
        });

    });
  });

  suite('GET /api/books => array of books', function () {

    test('Test GET /api/books', function (done) {
      chai.request(server)
        .get('/api/books')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          done();
        });
    });
  });

  suite('DELETE /api/books/[id] => delete book object id', function () {

    test('Test DELETE /api/books/[id] with valid id in db', function (done) {
      new Book({ title: 'Test Book', comments: [] })
        .save()
        .then((book) => {
          chai.request(server)
            .delete(`/api/books/${book._id.toString()}`)
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'delete successful');
              done();
            });
        })
        .catch((error) => {
          console.log(err);
        });
    });

    test('Test DELETE /api/books/[id] with id not in db', function (done) {
      chai.request(server)
        .delete('/api/books/invalidid')
        .end(function (err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

    test('Test DELETE /api/books', function (done) {
      chai.request(server)
        .delete('/api/books')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'complete delete successful');
          done();
        });
    });
  });
});
