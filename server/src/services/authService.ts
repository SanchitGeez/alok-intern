import { User, IUserDocument } from '@/models/User';
import { JWTService } from '@/utils/jwt';
import { RegisterInput, LoginInput } from '@/utils/validation';
import { AuthResponse, IUserPayload } from '@/types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if patientId is already taken (for patients only)
    if (userData.role === 'patient' && userData.patientId) {
      const existingPatient = await User.findOne({ 
        patientId: userData.patientId,
        role: 'patient'
      });
      if (existingPatient) {
        throw new Error('Patient ID already exists');
      }
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const userPayload: IUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      patientId: user.patientId,
    };

    const token = JWTService.generateToken(userPayload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: user.patientId,
      },
      token,
    };
  }

  /**
   * Login user
   */
  static async login(credentials: LoginInput): Promise<AuthResponse> {
    // Find user by email and include password
    const user = await User.findOne({ email: credentials.email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const userPayload: IUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      patientId: user.patientId,
    };

    const token = JWTService.generateToken(userPayload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: user.patientId,
      },
      token,
    };
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: Partial<Pick<RegisterInput, 'name' | 'patientId'>>
  ): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if patientId is being updated and is already taken
    if (updateData.patientId && updateData.patientId !== user.patientId) {
      const existingPatient = await User.findOne({ 
        patientId: updateData.patientId,
        role: 'patient',
        _id: { $ne: userId }
      });
      if (existingPatient) {
        throw new Error('Patient ID already exists');
      }
    }

    // Update allowed fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.patientId) user.patientId = updateData.patientId;

    await user.save();
    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = JWTService.verifyRefreshToken(refreshToken);
      
      // Verify user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const userPayload: IUserPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        patientId: user.patientId,
      };

      const token = JWTService.generateToken(userPayload);
      return { token };

    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: 'patient' | 'admin'
  ): Promise<{ users: IUserDocument[]; total: number; pages: number }> {
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await User.findByIdAndDelete(userId);
  }
}