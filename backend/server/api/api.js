import Message from '../../database/models/Message';
import User from '../../database/models/User';
import Room from '../../database/models/Room';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { secret, expiresIn } from '../../config/config_dev';
import { validate } from './utils';


const global$limit = 20;


export const register = async (req, res) => {
  try {
    // validate
    const validation = validate({ username: req.body.username.trim(), password: req.body.password.trim() }, req);
    if (!validation.isValid) {
      return res.status(401).json(validation);
    }

    // check if username already exists
    const user = await User.findOne({ username: req.body.username }).lean().exec();
    if (req.body.username === user?.username) return res.status(401).json({ isValid: false, usernameFeedback: 'Username already exists.', passwordFeedback: '\xa0' });

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
    // validate
    const validation = validate({ username: req.body.username.trim(), password: req.body.password.trim() }, req);
    if (!validation.isValid) {
      return res.status(401).json(validation);
    }

    // get user by username
    const user = await User.findOne({ username: req.body.username }).lean().exec();

    // if no user exists
    if (!user) {
      return res.status(401).json({ isValid: false, usernameFeedback: 'Wrong username or password.', passwordFeedback: 'Wrong username or password.' });
    }

    // if user exists
    let passwordIsValid = false;

    // compare password with hashPassword
    await bcrypt.compare(req.body.password, user.password)
      .then(match => {
        // if no match, send reason
        if (!match) {
          return res.status(401).json({ isValid: false, usernameFeedback: 'Wrong username or password.', passwordFeedback: 'Wrong username or password.' });
        // otherwise, passwordIsValid
        } else {
          passwordIsValid = true;
        }
      })
      .catch(err => res.status(500).json({ message: err.message }));

    // if passwordIsValid
    if (passwordIsValid) {
      const loggedInUser = await User.findOneAndUpdate({ username: req.body.username }, { isLoggedIn: true }, { new: true });

      if (!loggedInUser) {
        return res.status(500).json({ message: 'Could not log in user.' });

      // send token
      } else {
        // populate memberOf
        const populated = await loggedInUser.execPopulate('memberOf');
        populated.password = undefined;

        const payload = {
          _id: populated._id,
          username: populated.username,
        };

        jwt.sign(payload, secret, { expiresIn }, (err, token) => {
          if (err) {
            return res.status(500).json({ message: 'Could not log in user.' });
          } else {
            return res.send({ token: `Bearer ${token}`, user: populated });
          }
        });
      }
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const loginRequired = async (req, res, next) => {
  try {
    // if JWT is verified (not expired)
    if (req.user) {
      // see if user is a valid user (e.g. not a deleted account)
      const validUser = await User.findOne({ _id: req.user._id, username: req.user.username }).lean().exec();

      // if no validUser (e.g. deleted account) or is validUser but not logged in
      if (!validUser || !validUser.isLoggedIn) {
        return res.status(401).json({ unauthorized: true });
      // otherwise, if validUser and isLoggedIn
      } else {
        next();
      }

    // otherwise, JWT is not verified (e.g. expired)
    } else if (req.expiredUser) {
      await User.findOneAndUpdate({ _id: req.expiredUser._id, username: req.expiredUser.username }, { isLoggedIn: false }, { new: true }).lean().exec()
        .then( () => res.status(401).json({ expiredUser: true }) )
        .catch( err => res.status(500).json({ message: err.message }) )

    } else {
      return res.status(401).json({ unauthorized: true });
    }

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getLoggedInUser = async (req, res) => {
  try {
    // get user by username
    const user = await User.findOne({ _id: req.user._id, username: req.user.username });

    // if no user exists
    if (!user) {
      return res.status(401).json({ unauthorized: true });
    }

    // populate memberOf
    const populated = await user.execPopulate('memberOf');
    populated.password = undefined;

    return res.send(populated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const addNewRoom = async (req, res) => {
  try {
    const newRoom = await Room.create({
      roomname: req.body.roomname,
      createdBy: req.user._id
    });

    if (!newRoom) {
      return res.status(500).json({ message: 'Could not add new room.' });
    }

    // update user
    const user = await User.findOne({ _id: req.user._id, username: req.user.username });
    user.memberOf.push(newRoom._id);
    const updatedUser = await user.save();

    // populate memberOf
    const populated = await updatedUser.execPopulate('memberOf');
    populated.password = undefined;

    return res.send(populated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const joinNewRoom = async (req, res) => {
  try {
    const { chatId } = req.body;

    // check if can cast to ObjectId
    try {
      mongoose.Types.ObjectId(chatId);
    } catch (err) {
      return res.status(404).json({ noRoom: true });
    }

    // see if room exists
    const room = await Room.findOne({ _id: chatId }).lean().exec();

    if (!room) {
      return res.status(404).json({ noRoom: true });
    }

    // add room to memberOf property
    const user = await User.findOne({ _id: req.user._id, username: req.user.username });
    user.memberOf.push(chatId);
    const updatedUser = await user.save();

    // populate memberOf
    const populated = await updatedUser.execPopulate('memberOf');
    populated.password = undefined;

    return res.send(populated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const logout = async (req, res) => {
  try {
    const loggedOutUser = await User.findOneAndUpdate({ _id: req.user._id, username: req.user.username }, { isLoggedIn: false }, { new: true }).lean().exec();

    if (!loggedOutUser) {
      return res.status(500).json({ message: 'Could not log out user.' });
    }

    return res.sendStatus(200);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMessagesOnRoomChange = async (req, res) => {
  try {
    // get user and check if memberOf room trying to access
    const user = await User.findOne({ _id: req.user._id, username: req.user.username });
    const isMember = user.memberOf.some(roomId => roomId._id.toString() === req.params.room);
    if (!isMember) return res.status(401).json({ unauthorized: true });

    // isMember, therefore aggregate associated messages
    const agg = [
      { $match: { room: mongoose.Types.ObjectId(req.params.room) } },
      { $sort: { createdAt: -1 } }, { $limit: global$limit }
    ]
    const messages = await Message.aggregate(agg);

    if (!messages) {
      return res.json([]);
    }

    // populate messages with room and username info
    const populated = await Message
      .populate(messages, [ { path: 'room', model: 'Room', select: 'roomname' }, { path: 'username', model: 'User', select: 'username' } ]);

    return res.send(populated);

  } catch (err) {
    return res.status(500).json(err.message);
  }
};


export const getMoreMessages = async (req, res) => {
  try {
    // current room and date of last message
    const { room, last } = req.params;

    // get user and check if memberOf room trying to access
    const user = await User.findOne({ _id: req.user._id, username: req.user.username });
    const isMember = user.memberOf.some(roomId => roomId._id.toString() === room);
    if (!isMember) return res.status(401).json({ unauthorized: true });

    // find earlier dates
    const agg = [
      { $match: { room: mongoose.Types.ObjectId(room), createdAt: { $lt: new Date(last) } } },
      { $sort: { createdAt: -1 } },
      { $limit: global$limit }
    ];

    const messages = await Message.aggregate(agg);

    if (!messages) {
      return res.json([]);
    }

    // populate messages with room and username info
    const populated = await Message
      .populate(messages, [ { path: 'room', model: 'Room', select: 'roomname' }, { path: 'username', model: 'User', select: 'username' } ]);

    return res.send(populated);

  } catch (err) {
    return res.status(500).json(err.message);
  }
};