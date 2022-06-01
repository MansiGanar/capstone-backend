import mongoose from "mongoose";

const dbURL = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(`${dbURL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected.");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
