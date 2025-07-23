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

let _idTest = ''
let _commentLength = 0


suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  /*
  test.skip('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'comments', 'Books in array should contain comments');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  */
  /*
  * ----[END of EXAMPLE TEST]----
  */



  suite('Routing tests', function () {

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
            _idTest = res.body._id; // Store the _id for later tests

            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');

            done();
          });
      });

    });


    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', function (done) {
        Book.deleteMany({})
          .then(() => Book.create([
            { title: 'Book 1', comments: ['Comment 1'] },
            { title: 'Book 2', comments: ['Comment 2', 'Comment 3'] },
          ]))
          .then(() => chai.request(server).get('/api/books'))
          .then(res => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');

            console.log('Response body length:', res.body.length); // Debugging line to check the response structure

            assert.isAtLeast(res.body.length, 2, 'response array should have at least 2 books');
            res.body.forEach(book => {
              assert.isObject(book, 'Each book should be an object');
              assert.property(book, '_id', 'Books in array should contain _id');
              assert.property(book, 'title', 'Books in array should contain title');
              assert.isString(book.title, 'title should be a string');
              assert.property(book, 'commentcount', 'Books in array should contain commentcount');
            });

            done();
          })
          .catch(err => done(err));
      });
    });


    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/1234567890abcdef12345678')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isString(res.text)
            assert.equal(res.text, 'no book exists');

            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        Book.deleteMany({})
          .then(() => Book.create({ title: 'Test Book', comments: [] }))
          .then(book => _idTest = book._id.toString()) // Store the _id for later tests
          .then(() => chai.request(server).get(`/api/books/${_idTest}`))
          .then(res => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id')
            assert.property(res.body, 'title')
            assert.equal(res.body.title, 'Test Book')
            assert.property(res.body, 'comments')
            assert.isArray(res.body.comments, 'comments should be an array')

            done();
          })
          .catch(err => done(err));
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        Book.deleteMany({})
          .then(() => Book.create({ title: 'Test Book', comments: [] }))
          .then(book => {
            _idTest = book._id.toString(); // Store the _id for later tests
            _commentLength = book.comments.length; // Store initial comment length
            return chai.request(server).post(`/api/books/${_idTest}`).send({ comment: 'This is a test comment' });
          })
          .then(res => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.equal(res.body.title, 'Test Book');
            assert.property(res.body, 'comments');
            assert.isArray(res.body.comments, 'comments should be an array');
            assert.equal(res.body.comments.length, _commentLength + 1, 'comments length should increase by 1');
            res.body.comments.forEach(comment => {
              assert.isString(comment, 'each comment should be a string');
            });

            done();
          })
          .catch(err => done(err));
      });
    });

    test('Test POST /api/books/[id] without comment field', function (done) {
      Book.deleteMany({})
        .then(() => Book.create({ title: 'Test Book', comments: [] }))
        .then(book => {
          _idTest = book._id.toString(); // Store the _id for later tests
          _commentLength = book.comments.length; // Store initial comment length
          return chai.request(server)
            .post(`/api/books/${_idTest}`);
        })
        .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field comment');

          done();
        })
        .catch(err => done(err));

    });

    test('Test POST /api/books/[id] with comment, id not in db', function (done) {
      chai.request(server)
        .post(`/api/books/1234567890abcdef12345678`)
        .send({ comment: 'Test Comment for Nonexistent Book' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');

          done();
        });
    });

  });

  suite('DELETE /api/books/[id] => delete book object id', function () {

    test('Test DELETE /api/books/[id] with valid id in db', function (done) {
      Book.deleteMany({})
        .then(() => Book.create({ title: 'Test Book', comments: [] }))
        .then(book => {
          _idTest = book._id.toString(); // Store the _id for later tests
          return chai.request(server)
            .delete(`/api/books/${_idTest}`);
        })
        .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');

          done();
        })
        .catch(err => done(err));
    });

    test('Test DELETE /api/books/[id] with id not in db', function (done) {
      chai.request(server)
        .delete(`/api/books/1234567890abcdef12345678`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');

          done();
        });
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
