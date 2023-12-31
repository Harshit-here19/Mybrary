const express = require('express');
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book')

// All Authors Routes
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query.name
        })
    } catch {
        res.redirect('/')
    }
})

// New Authors Routes
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// Create Authors Route
router.post('/', (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    author.save().then(() => {
        res.redirect(`authors/${author.id}`)
        // res.redirect(`authors`)
    }).catch((error) => {
        res.render('authors/new', {
            author: author,
            errorMessage: ' Error Creating Author'
        })
    })
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const book = await Book.find({author : req.params.id}).limit(6)
        res.render('authors/show', { author : author,book : book })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        // const author = await Author.find({ id: req.params.id })
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author;
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch {
        if(author == null) {
            res.redirect('/');
        } else {
            res.render('/authors/edit', {
                author: author,
                errorMessage: ' Error Updating Author'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let author;
    let book;
    try{
        author = await Author.findById(req.params.id)
        // Here we don't want to delete the author which is connected to a book that's why ...
        book = await Book.find({author : author.id})
        if (book.length == 0) {
            await author.deleteOne();
        } else {
            throw new Error('Author is connected to a book');
        }
        res.redirect(`/authors`);
    } catch (err){
        console.log(err)
        if(author == null) {
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router;