"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const submissionController_1 = require("../controllers/submissionController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('patient'), upload_1.uploadImage.single('image'), upload_1.handleUploadError, submissionController_1.createSubmission);
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)('patient'), submissionController_1.getPatientSubmissions);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), submissionController_1.getAllSubmissions);
router.get('/:id', auth_1.authenticate, submissionController_1.getSubmission);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), submissionController_1.updateSubmission);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), submissionController_1.deleteSubmission);
router.post('/:id/generate-report', auth_1.authenticate, (0, auth_1.authorize)('admin'), submissionController_1.generateReport);
exports.default = router;
//# sourceMappingURL=submissions.js.map