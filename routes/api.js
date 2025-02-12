/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');
const Book = mongoose.model('Book', new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
}));

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find();
        res.json(books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        })));
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.status(400).send('missing required field title');
      }
      try {
        const newBook = new Book({ title, comments: [] });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        console.error('Error creating new book:', err);
        res.status(500).send('Server error');
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        await Book.deleteMany();
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Server error');
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send('no book exists');
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      //json res format same as .get
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
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.status(404).send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.status(500).send('Server error');
      }
    });

};
