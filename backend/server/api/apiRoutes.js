import { Router } from 'express';
import {
  register,
  login,
  loginRequired,
  getLoggedInUser,
  addNewRoom,
  joinNewRoom,
  logout,
  getMessagesOnRoomChange,
  getMoreMessages
} from './api';

const apiRouter = Router();


apiRouter.route('/register')
  .post(register);

apiRouter.route('/login')
  .post(login);

apiRouter.route('/logout')
  .all(loginRequired)
  .post(logout);

apiRouter.route('/getLoggedInUser')
  .all(loginRequired)
  .get(getLoggedInUser);

apiRouter.route('/addNewRoom')
  .all(loginRequired)
  .post(addNewRoom);

apiRouter.route('/joinNewRoom')
  .all(loginRequired)
  .post(joinNewRoom);

apiRouter.route('/getMessagesOnRoomChange/:room')
  .all(loginRequired)
  .get(getMessagesOnRoomChange);

apiRouter.route('/getMoreMessages/:room/:last')
  .all(loginRequired)
  .get(getMoreMessages);



export default apiRouter;