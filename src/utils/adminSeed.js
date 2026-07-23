import User from "@/models/User";

const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const configuredAdminPassword = process.env.ADMIN_PASSWORD;

export const DEFAULT_ADMIN_EMAIL =
  configuredAdminEmail || "admin@bsxcapital.com";
export const DEFAULT_ADMIN_PASSWORD = configuredAdminPassword || "Admin@12345";

export async function ensureDefaultAdmin() {
  const existingAdmin = await User.findOne({
    $or: [
      { email: DEFAULT_ADMIN_EMAIL },
      { username: "admin" },
      { role: "admin" },
    ],
  });

  if (existingAdmin) {
    existingAdmin.country = existingAdmin.country || "United States";
    existingAdmin.deletedAt = null;
    existingAdmin.email = DEFAULT_ADMIN_EMAIL;
    existingAdmin.fullName = existingAdmin.fullName || "BSX Administrator";
    existingAdmin.isVerified = true;
    existingAdmin.phone = existingAdmin.phone || "+10000000000";
    existingAdmin.role = "admin";
    existingAdmin.status = "active";
    existingAdmin.username = "admin";

    return existingAdmin.save({ validateBeforeSave: false });
  }

  return User.create({
    country: "United States",
    deletedAt: null,
    email: DEFAULT_ADMIN_EMAIL,
    fullName: "BSX Administrator",
    isVerified: true,
    password: DEFAULT_ADMIN_PASSWORD,
    phone: "+10000000000",
    role: "admin",
    status: "active",
    username: "admin",
  });
}
