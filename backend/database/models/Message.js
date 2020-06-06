import mongoose from 'mongoose';


const MessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.ObjectId,
      ref: 'Room',
      required: true
    },
    username: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', MessageSchema);
export default Message;