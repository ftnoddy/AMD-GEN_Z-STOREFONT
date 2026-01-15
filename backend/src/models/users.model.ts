import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'director', 'placement_officer', 'admin'],
    required: true,
  },
  universityId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
