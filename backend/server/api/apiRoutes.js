import { Router } from 'express';
import {
  getMessagesOnLoad,
  getMoreMessages
} from './api';

const apiRouter = Router();


// dataOnLoad
apiRouter.route('/messagesOnLoad')
  .get(getMessagesOnLoad);

apiRouter.route('/getMoreMessages/:last')
  .get(getMoreMessages);



export default apiRouter;