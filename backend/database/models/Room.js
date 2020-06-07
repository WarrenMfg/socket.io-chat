import mongoose from 'mongoose';


const RoomSchema = new mongoose.Schema(
  {
    roomname: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Room = mongoose.model('Room', RoomSchema);
export default Room;