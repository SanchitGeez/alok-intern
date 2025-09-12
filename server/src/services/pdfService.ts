import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';

export interface ReportData {
  submissionId: string;
  patientDetails: {
    name: string;
    patientId: string;
    email: string;
    note?: string;
  };
  originalImagePath: string;
  annotatedImagePath?: string;
  annotationData?: any;
  findings: string;
  recommendations: string;
  doctorName: string;
  reportDate: Date;
}

export class PDFService {
  private static instance: PDFService;
  private reportsDir: string;

  private constructor() {
    this.reportsDir = config.PDF_OUTPUT_DIR || './uploads/reports';
    this.ensureReportsDirectory();
  }

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  public async generateReport(reportData: ReportData): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `report_${reportData.submissionId}_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        
        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Pipe the PDF to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        this.addHeader(doc, reportData);
        
        // Patient Information
        this.addPatientInfo(doc, reportData);
        
        // Images Section
        this.addImagesSection(doc, reportData);
        
        // Findings and Recommendations
        this.addFindingsSection(doc, reportData);
        
        // Footer
        this.addFooter(doc, reportData);

        // Finalize the document
        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, data: ReportData): void {
    // Header background
    doc.rect(0, 0, doc.page.width, 80)
       .fill('#399918');

    // Title
    doc.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('OralVis Healthcare', 50, 25);

    // Subtitle
    doc.fontSize(12)
       .font('Helvetica')
       .text('Dental Image Analysis Report', 50, 50);

    // Reset position and color
    doc.fillColor('black')
       .y = 100;
  }

  private addPatientInfo(doc: PDFKit.PDFDocument, data: ReportData): void {
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

  private addImagesSection(doc: PDFKit.PDFDocument, data: ReportData): void {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Image Analysis', 50, doc.y);

    let y = doc.y + 20;

    // Original Image
    if (fs.existsSync(data.originalImagePath)) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Original Image:', 50, y);
      
      try {
        doc.image(data.originalImagePath, 50, y + 20, {
          width: 250,
          height: 200,
          fit: [250, 200]
        });
      } catch (error) {
        doc.fontSize(12)
           .font('Helvetica')
           .text('Image could not be loaded', 50, y + 20);
      }
    }

    // Annotated Image (if available)
    if (data.annotatedImagePath && fs.existsSync(data.annotatedImagePath)) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Annotated Image:', 320, y);
      
      try {
        doc.image(data.annotatedImagePath, 320, y + 20, {
          width: 250,
          height: 200,
          fit: [250, 200]
        });
      } catch (error) {
        doc.fontSize(12)
           .font('Helvetica')
           .text('Annotated image could not be loaded', 320, y + 20);
      }
    }

    doc.y = y + 240;
  }

  private addFindingsSection(doc: PDFKit.PDFDocument, data: ReportData): void {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    // Findings
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Clinical Findings', 50, doc.y + 20);

    doc.fontSize(12)
       .font('Helvetica')
       .text(data.findings || 'No specific findings noted.', 50, doc.y + 10, {
         width: 500,
         align: 'left'
       });

    // Recommendations
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

  private addFooter(doc: PDFKit.PDFDocument, data: ReportData): void {
    const bottomMargin = 100;
    const footerY = doc.page.height - bottomMargin;

    // Doctor signature section
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Reviewed by:', 50, footerY - 40);

    doc.font('Helvetica')
       .text(data.doctorName, 50, footerY - 25);

    doc.text('Digital Signature', 50, footerY - 10);

    // Disclaimer
    doc.fontSize(10)
       .font('Helvetica')
       .text('This report is generated by OralVis Healthcare system and should be reviewed by a qualified healthcare professional.', 
             50, footerY + 20, {
               width: 500,
               align: 'center'
             });
  }

  public async deleteReport(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting PDF report:', error);
      return false;
    }
  }

  public getReportUrl(fileName: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/reports/${fileName}`;
  }
}