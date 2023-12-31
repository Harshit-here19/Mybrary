const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'images/gif']

// All Books Routes
router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        // lte - less than equal to
        query = query.lte('publishDate', req.query.publishedBefore)
    }

    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        // gte - greater than equal to 
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Books Routes
router.get('/new', async (req, res) => {
    renderFormPage(res, new Book(), 'new');
})

// Create Books Route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })

    saveCover(book, req.body.cover);

    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
        // res.redirect('books')
    } catch {
        renderNewPage(res, book, true);
    }
})

router.get('/:id',async (req, res)=>{
    try {
        const book = await Book.findById(req.params.id).populate('author');
        // const author = await Author.findById(book.author);
        res.render('books/show', {book:book})
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit',async (req, res)=>{
    try {
        const book = await Book.findById(req.params.id)
        renderFormPage(res,book,'edit');
    } catch {
        res.redirect('/books')
    }
})

router.put('/:id', async (req,res)=>{
    let book;
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.cover = req.body.cover
        book.description = req.body.description
        
        if(req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }

        await book.save();
        res.redirect(`/books/${book.id}`)
    } catch {
        if(book != null){
            renderFormPage(res,book,'edit',true)
        } else {
            res.redirect('/')
        }
    }
})

router.delete('/:id', async (req, res)=>{
    let book;
    try{
        book = await Book.findById(req.params.id);
        await book.deleteOne();
        res.redirect('/books')
    } catch {
        if (book == null) {
            res.redirect('/')
        } else {
            res.redirect(`/books/show`,{
                book : book,
                errorMessage : "Cannot delete book"
            })
        }
    }
})

async function renderFormPage(res, book,route ,hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render(`books/${route}`, params)
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (coverEncoded != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router;