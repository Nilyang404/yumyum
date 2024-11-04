import mogoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  // check if already connected
  if (isConnected) {
    console.log("using existing database connection");
    return;
  }
  // check .env file
  if (!process.env.MONGODB_URL) {
    console.log("MONGODB_URL is missing in .env file");
  }
  //try connecting to the database
  try {
    await mogoose.connect(process.env.MONGODB_URL, {
      dbName: "9900yumyum",
    });
    isConnected = true;
    console.log("new database connection");
  } catch (error) {
    console.error("database connection failed", error);
  }
};

export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return;
  }
  try {
    await mogoose.disconnect();
    isConnected = false;
    console.log("database disconnected");
  } catch (error) {
    console.error("database disconnection failed", error);
  }
};
