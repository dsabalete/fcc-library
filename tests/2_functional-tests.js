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

let _idTest = ''
let commentLength = 0


suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
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
          assert.property(res.body, 'comments', 'Books in array should contain comments');
          assert.equal(res.body.title, 'Test Book');
          assert.isArray(res.body.comments, 'comments should be an array')
          assert.equal(res.body.comments.length, 0)
          _idTest = res.body._id

          done();
        });
    });

    test('Test POST /api/books with no title given', function (done) {
      chai.request(server)
        .post('/api/books')
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.text, 'missing required field title');

          done();
        });
    });

  });

  suite('POST /api/books/[id] => add comment/expect book object with id', function () {

    test('Test POST /api/books/[id] with comment', function (done) {
      chai.request(server)
        .post(`/api/books/${_idTest}`)
        .send({ comment: 'Test Comment' })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.property(res.body, '_id')
          assert.property(res.body, 'title')
          assert.property(res.body, 'comments')
          assert.equal(res.body.title, 'Test Book')
          assert.isArray(res.body.comments, 'comments should be an array')
          let n = res.body.comments.length
          assert.equal(res.body.comments[n - 1], 'Test Comment')
          assert.equal(res.body.comments.length, commentLength + 1)

          done();
        });
    });

    // test('Test POST /api/books/[id] without comment field', function (done) {
    //   new Book({ title: 'Test Book', comments: [] })
    //     .save()
    //     .then((book) => {
    //       chai.request(server)
    //         .post(`/api/books/${book._id.toString()}`)
    //         .send({ comment: '' })
    //         .end(function (err, res) {
    //           assert.equal(res.status, 400);
    //           assert.equal(res.text, 'missing required field comment');
    //           done();
    //         });
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // });

    test('Test POST /api/books/[id] with comment, id not in db', function (done) {
      chai.request(server)
        .post('/api/books/1234567890abcdef12345678')
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
        .get('/api/books/1234567890abcdef12345678')
        .end(function (err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');

          done();
        });
    });

    test('Test GET /api/books/[id] with valid id in db', function (done) {
      chai.request(server)
        .get(`/api/books/${_idTest}`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id')
          assert.property(res.body, 'title')
          assert.property(res.body, 'comments')
          assert.equal(res.body.title, 'Test Book')
          assert.isArray(res.body.comments, 'comments should be an array')
          commentLength = res.body.comments.length

          done();
        });
    });
  });

  suite('GET /api/books => array of books', function () {

    test('Test GET /api/books', function (done) {
      chai.request(server)
        .get('/api/books')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array')
          assert.property(res.body[0], 'comments', 'Books in array should contain comments')
          assert.property(res.body[0], 'title', 'Books in array should contain title')
          assert.property(res.body[0], '_id', 'Books in array should contain _id')

          done();
        });
    });
  });

  suite('DELETE /api/books/[id] => delete book object id', function () {

    test('Test DELETE /api/books/[id] with valid id in db', function (done) {
      chai.request(server)
        .delete(`/api/books/${_idTest}`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');

          done();
        });

    });

    test('Test DELETE /api/books/[id] with id not in db', function (done) {
      chai.request(server)
        .delete('/api/books/1234567890abcdef12345678')
        .end(function (err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.text, 'no book exists');

          done();
        });
    });

    // test.skip('Test DELETE /api/books', function (done) {
    //   chai.request(server)
    //     .delete('/api/books')
    //     .end(function (err, res) {
    //       assert.equal(res.status, 200);
    //       assert.equal(res.text, 'complete delete successful');

    //       done();
    //     });
    // });
  });
});
