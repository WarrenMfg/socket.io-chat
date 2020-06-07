import { Router } from 'express';
import {
  register,
  login,
  getLoggedInUser,
  addNewRoom,
  logout,
  getMessagesOnLoad,
  getMoreMessages
} from './api';

const apiRouter = Router();


apiRouter.route('/register')
  // .all(validate)
  .post(register);

apiRouter.route('/login')
  // .all(validate)
  .post(login);

apiRouter.route('/logout')
  .post(logout);

apiRouter.route('/getLoggedInUser')
  .get(getLoggedInUser);

apiRouter.route('/addNewRoom')
  .post(addNewRoom);


// apiRouter.route('/rooms')
//   .get(getUsersRooms);

apiRouter.route('/messagesOnLoad')
  .get(getMessagesOnLoad);

apiRouter.route('/getMoreMessages/:last')
  .get(getMoreMessages);



export default apiRouter;