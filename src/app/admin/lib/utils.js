'use server'
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connection = {};

export const connectToDB = async () => {
  try {
    if (connection.isConnected) return;

    const { DB_PORT, DB_HOST, DB_NAME } = process.env;
    const db = await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const disconnectFromDB = async () => {
  try {
    if (!connection.isConnected) return;

    await mongoose.disconnect();
    connection.isConnected = false;
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
