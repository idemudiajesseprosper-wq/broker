import AuditLog from "@/models/AuditLog";
import User from "@/models/User";

export async function logAdminAction({
  action,
  adminId,
  ipAddress,
  newValue,
  previousValue,
  userId,
}) {
  let adminName = "Admin";

  if (adminId) {
    const admin = await User.findById(adminId).select("fullName email");
    adminName = admin?.fullName || admin?.email || adminName;
  }

  return AuditLog.create({
    action,
    adminId,
    adminName,
    ipAddress,
    newValue,
    previousValue,
    userId,
  });
}
