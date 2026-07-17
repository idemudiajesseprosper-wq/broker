const fs = require("node:fs");
const Cryptr = require("cryptr");
const mongoose = require("mongoose");

function loadEnvFile(path) {
  if (!fs.existsSync(path)) {
    return {};
  }

  return fs
    .readFileSync(path, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

      if (!match) {
        return env;
      }

      let value = match[2].trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[match[1]] = value;
      return env;
    }, {});
}

const env = loadEnvFile(".env.local");
const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
const adminEmail = (
  env.ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "admin@bsxcapital.com"
)
  .trim()
  .toLowerCase();
const adminPassword =
  env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Admin@12345";
const cryptrSecret = env.CRYPTR_SECRET_KEY || process.env.CRYPTR_SECRET_KEY;

if (!cryptrSecret) {
  throw new Error("CRYPTR_SECRET_KEY is not set");
}

const cryptr = new Cryptr(cryptrSecret);

const userSchema = new mongoose.Schema({
  country: String,
  deletedAt: Date,
  email: { lowercase: true, trim: true, type: String },
  fullName: String,
  isVerified: Boolean,
  password: { select: false, type: String },
  phone: String,
  role: String,
  status: String,
  username: String,
});

userSchema.pre("save", function encryptPassword() {
  if (this.isModified("password")) {
    this.password = cryptr.encrypt(this.password);
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(mongoUri);

  let admin = await User.findOne({
    $or: [{ email: adminEmail }, { username: "admin" }, { role: "admin" }],
  }).select("+password");

  if (!admin) {
    admin = new User();
  }

  admin.country = admin.country || "United States";
  admin.deletedAt = null;
  admin.email = adminEmail;
  admin.fullName = admin.fullName || "BSX Administrator";
  admin.isVerified = true;
  admin.password = adminPassword;
  admin.phone = admin.phone || "+10000000000";
  admin.role = "admin";
  admin.status = "active";
  admin.username = "admin";

  await admin.save({ validateBeforeSave: false });

  const verifiedAdmin = await User.findOne({ username: "admin" }).select(
    "+password",
  );
  const verified = cryptr.decrypt(verifiedAdmin.password) === adminPassword;

  console.log(
    verified
      ? "Admin credential reset and verified."
      : "Admin credential reset failed verification.",
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
