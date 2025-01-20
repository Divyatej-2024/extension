const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // To manage user sessions
const stripe = require('stripe')('your-stripe-secret-key'); // Payment gateway

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// Fake user database
const users = {
  'free_user@example.com': { password: 'password123', premium: false },
  'premium_user@example.com': { password: 'password456', premium: true },
};

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (users[email] && users[email].password === password) {
    req.session.user = { email, premium: users[email].premium };
    res.json({ message: 'Login successful', premium: users[email].premium });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Subscription endpoint
app.post('/subscribe', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: 'your-stripe-price-id', // Your Stripe product price ID
        quantity: 1,
      },
    ],
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });

  res.json({ url: session.url });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Check premium status
app.get('/status', (req, res) => {
  if (req.session.user) {
    res.json({ premium: req.session.user.premium });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
