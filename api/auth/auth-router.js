const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js');
const { isValid } = require("../users/users-service.js");

const Users = require('../users/users-model.js');

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

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!isValid(req.body)) {
      next({ apiCode: 400, apiMessage: 'invalid credentials' })
    } else {
      const [user] = await Users.findBy({ username: username });
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ message: `welcome, ${user.username}`, token })
      } else {
        next({ apiCode: 400, apiMessage: 'invalid credentials' });
      }
    } 
  } catch (err) {
    next({apiCode: 500, apiMessage: 'invalid credentials'})
  }
});

function generateToken(user) {

  const payload = {
    subject: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: "1d"
  };

  const token = jwt.sign(payload, secrets.jwtSecret, options);

  return token;

}

module.exports = router;
