import { User, IUser } from '../models/User';
import { hashPassword } from '../services/authService';

export async function ensureAdminUser() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminEmail = 'admin@poster-maker.com';
      const passwordHash = await hashPassword('AdminPassword@123');
      const admin = new User({
        name: 'সুপার অ্যাডমিন (Super Admin)',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isEmailVerified: true,
      } as Partial<IUser>);
      await admin.save();
      console.log(`🛡️ Default Admin created: ${adminEmail} / AdminPassword@123`);
    } else {
      console.log(`🛡️ Admin verified in DB: ${existingAdmin.email}`);
    }
  } catch (err) {
    console.warn('⚠️ Could not verify/seed admin user:', err);
  }
}
