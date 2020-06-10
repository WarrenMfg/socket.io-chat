import mongoose from 'mongoose';
import { URI } from '../config/config_dev';


export const connect = (location = URI) => {
  mongoose.connect(location, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log('Connected to socketman!'))
    .catch(err => console.log('connection error:', err));
};