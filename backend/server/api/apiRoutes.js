import { Router } from 'express';
import {
  getDataOnLoad
} from './api';

const apiRouter = Router();


// dataOnLoad
apiRouter.route('/dataOnLoad')
  .get(getDataOnLoad);

export default apiRouter;