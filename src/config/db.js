import dns from "node:dns";
import mongoose from "mongoose";

const cached = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

// Windows/ISP DNS can reject MongoDB Atlas SRV lookups in Node even when
// PowerShell resolves them. Mongoose uses Node DNS, so pin reliable resolvers.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Opens one MongoDB connection and reuses it across hot reloads/serverless calls.
export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15_000,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
