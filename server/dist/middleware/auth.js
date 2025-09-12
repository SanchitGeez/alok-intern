"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.ensureOwnData = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("@/utils/jwt");
const User_1 = require("@/models/User");
const authenticate = async (req, res, next) => {
    try {
        let token = jwt_1.JWTService.extractTokenFromHeader(req.headers.authorization);
        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const decoded = jwt_1.JWTService.verifyToken(token);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Token is no longer valid. User not found.',
            });
            return;
        }
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            patientId: user.patientId,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Invalid token',
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const ensureOwnData = (resourceUserIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const resourceUserId = req.params[resourceUserIdParam];
        if (req.user.role === 'patient' && req.user.userId !== resourceUserId) {
            res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own data.',
            });
            return;
        }
        next();
    };
};
exports.ensureOwnData = ensureOwnData;
const optionalAuth = async (req, res, next) => {
    try {
        let token = jwt_1.JWTService.extractTokenFromHeader(req.headers.authorization);
        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }
        if (token) {
            const decoded = jwt_1.JWTService.verifyToken(token);
            const user = await User_1.User.findById(decoded.userId);
            if (user) {
                req.user = {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    patientId: user.patientId,
                };
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map