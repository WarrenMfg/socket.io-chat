import Message from '../../database/models/Message';
import User from '../../database/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { secret, expiresIn } from '../../config/config';


const global$limit = 20;


export const register = async (req, res) => {
  try {
    // check if username already exists
    const user = await User.findOne({ username: req.body.username }).lean().exec();
    if (req.body.username === user?.username) return res.status(401).json({ message: 'Account with the associated username already exists.' });

    // create newUser
    const newUser = new User({
      username: req.body.username,
      password: req.body.password
    });

    // hash password
    await bcrypt.hash(newUser.password, 10)
      .then(hash => newUser.password = hash)
      .catch(err => res.status(500).json({ message: err.message }));

    // save new user
    newUser.save()
      .then(user => {
        user.password = undefined;
        res.send(user);
      })
      .catch(err => res.status(500).json({ message: err.message }));

  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};


export const login = async (req, res) => {
  try {
    // get user by username
    const user = await User.findOne({ username: req.body.username }).lean().exec();

    // if no user exists
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. Wrong username or password.' });
    }

    // if user exists
    let passwordIsValid = false;

    // compare password with hashPassword
    await bcrypt.compare(req.body.password, user.password)
      .then(match => {
        // if no match, send reason
        if (!match) {
          return res.status(401).json({ message: 'Authentication failed. Wrong username or password.' });
        // otherwise, passwordIsValid
        } else {
          passwordIsValid = true;
        }
      })
      .catch(err => res.status(500).json({ message: err.message }));

    // if passwordIsValid
    if (passwordIsValid) {
      const loggedInUser = await User.findOneAndUpdate({ username: req.body.username }, { isLoggedIn: true }, { new: true }).lean().exec();

      if (!loggedInUser) {
        return res.status(500).json({ message: 'Could not log in user.' });

      // send token
      } else {
        const payload = {
          _id: loggedInUser._id,
          username: loggedInUser.username,
        };

        jwt.sign(payload, secret, { expiresIn }, (err, token) => {
          if (err) {
            return res.status(500).json({ message: 'Could not log in user.' });
          } else {
            return res.send({ token: `Bearer ${token}`, user: {...loggedInUser, password: undefined} });
          }
        });
      }
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getLoggedInUser = async (req, res) => {
  try {
    if (req.user) {
      // get user by username
      const user = await User.findOne({ username: req.user.username }).lean().exec();

      // if no user exists
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed. Wrong username or password.' });
      }

      return res.send(user);

    // invalid or no JWT
    } else {
      return res.status(401).json({ message: 'Authentication failed. Please log in.' });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMessagesOnLoad = async (req, res) => {
  try {
    const messages = await Message.aggregate([ { $sort: { createdAt: -1 } }, { $limit: global$limit } ]);

    if (!messages) {
      return res.json([]);
    }

    return res.send(messages);

  } catch (err) {
    return res.status(500).json(err.message);
  }
};


export const getMoreMessages = async (req, res) => {
  try {
    const { last } = req.params;
    const agg = [
      { $match: { createdAt: { $lt: new Date(last) } } },
      { $sort: { createdAt: -1 } },
      { $limit: global$limit }
    ];

    const messages = await Message.aggregate(agg);

    if (!messages) {
      return res.json([]);
    }

    return res.send(messages);

  } catch (err) {
    return res.status(500).json(err.message);
  }
};