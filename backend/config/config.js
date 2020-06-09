import { secret_dev, expiresIn_dev, URI_dev } from './config_dev';

export const secret = process.env.SECRET || secret_dev;

export const expiresIn = process.env.EXPIRESIN || expiresIn_dev;

export const URI = process.env.MONGO_URI || URI_dev;