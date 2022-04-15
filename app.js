const express = require('express')
const ejs = require('ejs')
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const multer = require('multer')

const app = express()
const Schema = mongoose.Schema;

//db connection
mongoose.connect('mongodb://localhost:27017/milmaDB')
    .then(console.log('connected to db successfully'))
    .catch((err) => {console.log('connection to database failed.. try entering mongod in a terminal and try again')})

// new product schema
const productSchema = new Schema({
    flavour: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: {
        data: Buffer,
        type: String
    }
})

//new product model
const Product = mongoose.model('Product', productSchema)

//image upload directory
const storage = multer.diskStorage({

    //destination for files
    destination: (req, file, callback) => {
        callback(null, './public/uploads/')
    },

    //add extension
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
})

//upload parameters for multer
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 *10
    } 
})


app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
    Product.find({}, (err, products) => {
        if (err) {
            console.log(err)
        } else {
            res.render('home', {products: products})
        }
    })
})

app.get('/admin', (req, res) => {
    Product.find({}, (err, products) => {
        if (err) {
            console.log(err)
        } else {
            res.render('admin', {notification: notification, products: products})
            notification = ''
        }
    })
})

//to send notification if upload successfull
let notification = ''

app.post('/admin', upload.single('img'), (req, res) => {

    const newProduct = new Product({
        flavour: req.body.flavour,
        name: req.body.name,
        amount: req.body.amount,
        price: req.body.price,
        img: req.file.filename
    })

    newProduct.save().then(() => {
        console.log('new product added')
        notification = 'Product Added Successfully'
        res.redirect('/admin')
    })

})




let deleteNotification = ''

app.get('/viewproducts', (req, res) => {
    Product.find({}, (err, products) => {
        if (err) {
            console.log(err)
        } else {
            res.render('viewproducts', {products: products, deleteNotification: deleteNotification})
            deleteNotification = ''
        }
    })
})


app.post('/delete', (req, res) => {
    Product.findByIdAndRemove(req.body.id, (err) => {
        if(err) {
            console.log(err)
        } else {
            deleteNotification = 'Deleted Successfully'
            console.log('Deleted Successfully')
            res.redirect('/viewproducts')
        }
    })
})

app.listen(3000, () => {
    console.log('server started at port 3000')
})