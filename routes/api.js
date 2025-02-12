/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
const Book = require('../models/Book');

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find();

        res.json(books.map(book => ({
          _id: book._id.toString(),
          title: book.title,
          comments: book.comments
        })));
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .post(async function (req, res) {
      if (!req.body || !('title' in req.body)) {
        return res.status(400).send('missing required field title');
      }

      const title = req.body.title;
      if (title === '') {
        return res.status(400).send('missing required field title');
      }

      try {
        const newBook = await new Book({ title, comments: [] }).save();
        res.json({ _id: newBook._id.toString(), title: newBook.title, comments: newBook.comments });
      } catch (err) {
        console.error('Error creating new book:', err);
        res.status(500).send('Server error');
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany();

        res.status(200).send('complete delete successful');
      } catch (err) {
        res.status(500).send('Server error');
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(404).send('no book exists');
      }

      try {
        const book = await Book.findById(bookid);

        if (!book) {
          return res.status(404).send('no book exists');
        }
        res.json({ _id: book._id.toString(), title: book.title, comments: book.comments });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(404).send('no book exists');
      }

      if (!comment) {
        return res.status(400).send('missing required field comment');
      }

      try {
        const book = await Book.findById(bookid);

        if (!book) {
          return res.status(404).send('no book exists');
        }

        book.comments.push(comment);
        await book.save();

        res.json({ _id: book._id.toString(), title: book.title, comments: book.comments });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(404).send('no book exists');
      }

      try {
        const book = await Book.findByIdAndDelete(bookid);

        if (!book) {
          return res.status(404).send('no book exists');
        }

        res.status(200).send('delete successful');
      } catch (err) {
        res.status(500).send('Server error');
      }
    });

};
