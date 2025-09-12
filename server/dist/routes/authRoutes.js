"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const security_1 = require("../middleware/security");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/register', security_1.authLimiter, (0, errorHandler_1.asyncHandler)(authController_1.AuthController.register));
router.post('/login', security_1.authLimiter, (0, errorHandler_1.asyncHandler)(authController_1.AuthController.login));
router.post('/logout', (0, errorHandler_1.asyncHandler)(authController_1.AuthController.logout));
router.get('/profile', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController_1.AuthController.getProfile));
router.put('/profile', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController_1.AuthController.updateProfile));
router.post('/change-password', auth_1.authenticate, security_1.passwordResetLimiter, (0, errorHandler_1.asyncHandler)(authController_1.AuthController.changePassword));
router.get('/verify', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController_1.AuthController.verifyToken));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map