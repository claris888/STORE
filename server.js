const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Products storage (in-memory for simplicity)
let products = [
  { id: 1, name: 'Apple', image: 'apple.svg', price: 2.99 },
  { id: 2, name: 'Banana', image: 'banana.svg', price: 1.99 },
  { id: 3, name: 'Orange', image: 'orange.svg', price: 3.49 },
  { id: 4, name: 'Strawberry', image: 'strawberry.svg', price: 4.99 }
];

// Authentication middleware
const authMiddleware = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect('/product');
  } else {
    res.redirect('/login');
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'customer@store.com' && password === '1234') {
    req.session.authenticated = true;
    req.session.user = { email };
    res.redirect('/product');
  } else {
    res.render('login', { error: 'Invalid email or password' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Product page
app.get('/product', authMiddleware, (req, res) => {
  res.render('product', { products, user: req.session.user });
});

// Add product page
app.get('/add-product', authMiddleware, (req, res) => {
  res.render('add-product', { user: req.session.user });
});

// Handle add product
app.post('/add-product', authMiddleware, (req, res) => {
  const { name, image, price } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    image,
    price: parseFloat(price)
  };
  products.push(newProduct);
  res.redirect('/product');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
