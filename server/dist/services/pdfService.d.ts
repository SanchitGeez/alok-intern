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
export declare class PDFService {
    private static instance;
    private reportsDir;
    private constructor();
    static getInstance(): PDFService;
    private ensureReportsDirectory;
    generateReport(reportData: ReportData): Promise<string>;
    private addHeader;
    private addPatientInfo;
    private addImagesSection;
    private addFindingsSection;
    private addFooter;
    deleteReport(filePath: string): Promise<boolean>;
    getReportUrl(fileName: string): string;
}
//# sourceMappingURL=pdfService.d.ts.map