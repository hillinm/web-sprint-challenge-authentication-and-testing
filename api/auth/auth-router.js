const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/users-model.js');
const secrets = require('../config/secrets.js');

function userCheck(req, res, next) {
  const user = req.body;

  if (user.username && user.password) {
    next();
  } else {
    res.status(400).json({ message: 'username and password required'});
  }
}

router.post('/register', userCheck, (req, res) => {
  const user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);

  user.password = hash;

  Users.add(user)
  .then(newUser => {
    res.status(201).json(newUser);
  })
  .catch(err => {
    res.status(500).json({ message: 'username taken', err});
  })
});

router.post('./login', (req, res) => {
  const { username, password } = req.body;

  function isValid(user) {
    return Boolean(
      user.username && user.password && typeof user.password === 'string')
    }

    if (isValid(req.body)) {
      Users.findBy({ username: username })
      .then(([user]) => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user)
          res.status(200).json({ message: `welcome ${user.username}`, token});
        } else {
          res.status(401).json({ message: 'invalid credentials'});
        }
      })
      .catch(err => {
        res.status(500).json({ message: err.message });
      });
    } else {
      res.status(400).json({ message: "username and password required"})
    }
  })


function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    password: user.password,
  }
  const options = {
      expiresIn: "1hr"
  }
  const secret = secrets.jwtSecret
  return jwt.sign(payload, options, secret);
}

module.exports = router;
