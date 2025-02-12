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

const demoBook = { title: 'Test Book', comments: [] };


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

  suite('Routing tests', function () {

    suite('POST /api/books with title => create book object/expect book object', function () {

      test('Test POST /api/books with title', async function () {
        const res = await chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' });

        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.equal(res.body.title, 'Test Book');
      });

      test('Test POST /api/books with no title given', async function () {
        const res = await chai.request(server)
          .post('/api/books')
          .send({ title: '' });

        assert.equal(res.status, 400);
        assert.equal(res.text, 'missing required field title');
      });

    });


    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', async function () {
        const res = await chai.request(server)
          .get('/api/books');

        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', async function () {
        const res = await chai.request(server)
          .get('/api/books/invalidid');

        assert.equal(res.status, 404);
        assert.equal(res.text, 'no book exists');
      });

      test('Test GET /api/books/[id] with valid id in db', async function () {
        const book = await new Book({ title: 'Test Book', comments: [] }).save();
        const res = await chai.request(server)
          .get(`/api/books/${book._id.toString()}`);

        assert.equal(res.status, 200);
        assert.equal(res.body._id, book._id.toString());
        assert.equal(res.body.title, 'Test Book');
        assert.deepEqual(res.body.comments, []);
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', async function () {
        const book = await new Book({ title: 'Test Book', comments: [] }).save();

        const res = await chai.request(server)
          .post(`/api/books/${book._id}`)
          .send({ comment: 'Test Comment' });

        assert.equal(res.status, 200);
        assert.include(res.body.comments, 'Test Comment');
      });
    });

    test('Test POST /api/books/[id] without comment field', async function () {
      const book = new Book({ title: 'Test Book', comments: [] });
      const res = await chai.request(server)
        .post(`/api/books/${book._id}`)
        .send({ comment: '' });

      assert.equal(res.status, 400);
      assert.equal(res.text, 'missing required field comment');
    });

    test('Test POST /api/books/[id] with comment, id not in db', async function () {
      const res = await chai.request(server)
        .post('/api/books/invalidid')
        .send({ comment: 'Test Comment' });

      assert.equal(res.status, 404);
      assert.equal(res.text, 'no book exists');
    });

  });

  suite('DELETE /api/books/[id] => delete book object id', function () {

    test('Test DELETE /api/books/[id] with valid id in db', async function () {
      const book = await new Book({ title: 'Test Book', comments: [] }).save();
      const res = await chai.request(server)
        .delete(`/api/books/${book._id}`);

      assert.equal(res.status, 200);
      assert.equal(res.text, 'delete successful');
    });

    test('Test DELETE /api/books/[id] with  id not in db', async function () {
      const res = await chai.request(server)
        .delete('/api/books/invalidid');

      assert.equal(res.status, 404);
      assert.equal(res.text, 'no book exists');
    });

  });

});
