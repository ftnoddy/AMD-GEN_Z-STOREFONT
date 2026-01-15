import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  currentJobTitle: string;
  yearsOfExperience: number;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  currentJobTitle: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true, min: 0 },
});

const UserModel = mongoose.model<IUserDocument>("Customer_login", UserSchema);


export default UserModel;
