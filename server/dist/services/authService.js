"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async register(userData) {
        const existingUser = await User_1.User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        if (userData.role === 'patient' && userData.patientId) {
            const existingPatient = await User_1.User.findOne({
                patientId: userData.patientId,
                role: 'patient'
            });
            if (existingPatient) {
                throw new Error('Patient ID already exists');
            }
        }
        const user = new User_1.User(userData);
        await user.save();
        const userPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            patientId: user.patientId,
        };
        const token = jwt_1.JWTService.generateToken(userPayload);
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
    static async login(credentials) {
        const user = await User_1.User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await user.comparePassword(credentials.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const userPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            patientId: user.patientId,
        };
        const token = jwt_1.JWTService.generateToken(userPayload);
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
    static async getUserProfile(userId) {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    static async updateUserProfile(userId, updateData) {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (updateData.patientId && updateData.patientId !== user.patientId) {
            const existingPatient = await User_1.User.findOne({
                patientId: updateData.patientId,
                role: 'patient',
                _id: { $ne: userId }
            });
            if (existingPatient) {
                throw new Error('Patient ID already exists');
            }
        }
        if (updateData.name)
            user.name = updateData.name;
        if (updateData.patientId)
            user.patientId = updateData.patientId;
        await user.save();
        return user;
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await User_1.User.findById(userId).select('+password');
        if (!user) {
            throw new Error('User not found');
        }
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        user.password = newPassword;
        await user.save();
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt_1.JWTService.verifyRefreshToken(refreshToken);
            const user = await User_1.User.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            const userPayload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                patientId: user.patientId,
            };
            const token = jwt_1.JWTService.generateToken(userPayload);
            return { token };
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static async getAllUsers(page = 1, limit = 10, role) {
        const filter = role ? { role } : {};
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_1.User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            User_1.User.countDocuments(filter),
        ]);
        return {
            users,
            total,
            pages: Math.ceil(total / limit),
        };
    }
    static async deleteUser(userId) {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await User_1.User.findByIdAndDelete(userId);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map