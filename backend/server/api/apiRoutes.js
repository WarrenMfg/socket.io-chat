import { Router } from 'express';
import {
  register,
  login,
  getLoggedInUser,
  addNewRoom,
  joinNewRoom,
  logout,
  getMessagesOnRoomChange,
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

apiRouter.route('/joinNewRoom')
  .post(joinNewRoom);

apiRouter.route('/getMessagesOnRoomChange/:room')
  .get(getMessagesOnRoomChange);

apiRouter.route('/getMoreMessages/:last')
  .get(getMoreMessages);



export default apiRouter;