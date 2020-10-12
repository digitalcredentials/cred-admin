import dotenv from "dotenv";

// Set the env file
if (process.env.NODE_ENV !== "production") {
  const result2 = dotenv.config();

  if (result2.error) {
    throw result2.error;
  }
}
