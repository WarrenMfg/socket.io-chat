import mongoose from 'mongoose';


const RoomSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.ObjectId,
      required: true
    },
    createdBy: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Room = mongoose.model('Room', RoomSchema);
export default Room;