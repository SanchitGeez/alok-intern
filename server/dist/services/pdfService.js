"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const environment_1 = require("../config/environment");
class PDFService {
    constructor() {
        this.reportsDir = environment_1.config.PDF_OUTPUT_DIR || './uploads/reports';
        this.ensureReportsDirectory();
    }
    static getInstance() {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }
    ensureReportsDirectory() {
        if (!fs_1.default.existsSync(this.reportsDir)) {
            fs_1.default.mkdirSync(this.reportsDir, { recursive: true });
        }
    }
    async generateReport(reportData) {
        return new Promise((resolve, reject) => {
            try {
                const fileName = `report_${reportData.submissionId}_${Date.now()}.pdf`;
                const filePath = path_1.default.join(this.reportsDir, fileName);
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });
                const stream = fs_1.default.createWriteStream(filePath);
                doc.pipe(stream);
                this.addHeader(doc, reportData);
                this.addPatientInfo(doc, reportData);
                this.addImagesSection(doc, reportData);
                this.addFindingsSection(doc, reportData);
                this.addFooter(doc, reportData);
                doc.end();
                stream.on('finish', () => {
                    resolve(filePath);
                });
                stream.on('error', (error) => {
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    addHeader(doc, data) {
        doc.rect(0, 0, doc.page.width, 80)
            .fill('#399918');
        doc.fillColor('white')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('OralVis Healthcare', 50, 25);
        doc.fontSize(12)
            .font('Helvetica')
            .text('Dental Image Analysis Report', 50, 50);
        doc.fillColor('black')
            .y = 100;
    }
    addPatientInfo(doc, data) {
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Patient Information', 50, doc.y + 20);
        doc.fontSize(12)
            .font('Helvetica');
        const info = [
            ['Patient Name:', data.patientDetails.name],
            ['Patient ID:', data.patientDetails.patientId],
            ['Email:', data.patientDetails.email],
            ['Report Date:', data.reportDate.toLocaleDateString()],
            ['Submission ID:', data.submissionId]
        ];
        let y = doc.y + 10;
        info.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').text(label || '', 50, y);
            doc.font('Helvetica').text(value || '', 150, y);
            y += 20;
        });
        if (data.patientDetails.note) {
            doc.font('Helvetica-Bold').text('Patient Note:', 50, y);
            doc.font('Helvetica').text(data.patientDetails.note, 50, y + 15, {
                width: 500,
                align: 'left'
            });
            y += 40;
        }
        doc.y = y + 20;
    }
    addImagesSection(doc, data) {
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Image Analysis', 50, doc.y);
        let y = doc.y + 20;
        if (fs_1.default.existsSync(data.originalImagePath)) {
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('Original Image:', 50, y);
            try {
                doc.image(data.originalImagePath, 50, y + 20, {
                    width: 250,
                    height: 200,
                    fit: [250, 200]
                });
            }
            catch (error) {
                doc.fontSize(12)
                    .font('Helvetica')
                    .text('Image could not be loaded', 50, y + 20);
            }
        }
        if (data.annotatedImagePath && fs_1.default.existsSync(data.annotatedImagePath)) {
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('Annotated Image:', 320, y);
            try {
                doc.image(data.annotatedImagePath, 320, y + 20, {
                    width: 250,
                    height: 200,
                    fit: [250, 200]
                });
            }
            catch (error) {
                doc.fontSize(12)
                    .font('Helvetica')
                    .text('Annotated image could not be loaded', 320, y + 20);
            }
        }
        doc.y = y + 240;
    }
    addFindingsSection(doc, data) {
        if (doc.y > 600) {
            doc.addPage();
        }
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Clinical Findings', 50, doc.y + 20);
        doc.fontSize(12)
            .font('Helvetica')
            .text(data.findings || 'No specific findings noted.', 50, doc.y + 10, {
            width: 500,
            align: 'left'
        });
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Recommendations', 50, doc.y + 30);
        doc.fontSize(12)
            .font('Helvetica')
            .text(data.recommendations || 'Follow standard care protocols.', 50, doc.y + 10, {
            width: 500,
            align: 'left'
        });
    }
    addFooter(doc, data) {
        const bottomMargin = 100;
        const footerY = doc.page.height - bottomMargin;
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Reviewed by:', 50, footerY - 40);
        doc.font('Helvetica')
            .text(data.doctorName, 50, footerY - 25);
        doc.text('Digital Signature', 50, footerY - 10);
        doc.fontSize(10)
            .font('Helvetica')
            .text('This report is generated by OralVis Healthcare system and should be reviewed by a qualified healthcare professional.', 50, footerY + 20, {
            width: 500,
            align: 'center'
        });
    }
    async deleteReport(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error deleting PDF report:', error);
            return false;
        }
    }
    getReportUrl(fileName) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        return `${baseUrl}/uploads/reports/${fileName}`;
    }
}
exports.PDFService = PDFService;
//# sourceMappingURL=pdfService.js.map