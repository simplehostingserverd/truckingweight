/**
 * Electronic Data Interchange (EDI) Service
 * Handles EDI document generation and processing for freight billing
 */

import { logger } from '../../utils/logger';

export interface EDIDocument {
  transactionSetId: string;
  documentType: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
}

export interface EDI210Invoice {
  invoiceNumber: string;
  invoiceDate: Date;
  billToParty: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
  totalAmount: number;
}

export class EDIService {
  /**
   * Generate EDI 210 Invoice document
   */
  async generateEDI210(invoice: EDI210Invoice): Promise<EDIDocument> {
    try {
      logger.info(`Generating EDI 210 for invoice ${invoice.invoiceNumber}`);

      const ediContent = this.buildEDI210Content(invoice);

      const document: EDIDocument = {
        transactionSetId: this.generateTransactionSetId(),
        documentType: 'EDI_210',
        senderId: 'TRUCKING_WEIGHTS',
        receiverId: 'CUSTOMER',
        content: ediContent,
        createdAt: new Date()
      };

      return document;
    } catch (error) {
      logger.error('Error generating EDI 210:', error);
      throw error;
    }
  }

  /**
   * Build EDI 210 content string
   */
  private buildEDI210Content(invoice: EDI210Invoice): string {
    const segments: string[] = [];

    // ISA - Interchange Control Header
    segments.push('ISA*00*          *00*          *ZZ*TRUCKINGWTS   *ZZ*CUSTOMER      *' + 
                  this.formatDate(new Date()) + '*' + this.formatTime(new Date()) + '*U*00401*' + 
                  this.generateControlNumber() + '*0*P*>~');

    // GS - Functional Group Header
    segments.push('GS*IN*TRUCKINGWTS*CUSTOMER*' + this.formatDate(new Date()) + '*' + 
                  this.formatTime(new Date()) + '*' + this.generateControlNumber() + '*X*004010~');

    // ST - Transaction Set Header
    segments.push('ST*210*' + this.generateControlNumber() + '~');

    // B3 - Beginning Segment for Invoice
    segments.push('B3*' + invoice.invoiceNumber + '*' + this.formatDate(invoice.invoiceDate) + '~');

    // N1 - Name segments for bill-to party
    segments.push('N1*BT*' + invoice.billToParty.name + '~');
    segments.push('N3*' + invoice.billToParty.address + '~');
    segments.push('N4*' + invoice.billToParty.city + '*' + invoice.billToParty.state + '*' + 
                  invoice.billToParty.zipCode + '~');

    // L0/L5 - Line item details
    invoice.lineItems.forEach((item, index) => {
      segments.push('L0*' + (index + 1) + '*' + item.quantity + '*' + item.description + '~');
      segments.push('L5*' + item.totalAmount.toFixed(2) + '~');
    });

    // L3 - Total weight and charges
    segments.push('L3*' + invoice.totalAmount.toFixed(2) + '~');

    // SE - Transaction Set Trailer
    segments.push('SE*' + (segments.length + 1) + '*' + this.generateControlNumber() + '~');

    // GE - Functional Group Trailer
    segments.push('GE*1*' + this.generateControlNumber() + '~');

    // IEA - Interchange Control Trailer
    segments.push('IEA*1*' + this.generateControlNumber() + '~');

    return segments.join('');
  }

  /**
   * Validate EDI document format
   */
  async validateEDIDocument(document: EDIDocument): Promise<boolean> {
    try {
      // Basic validation - check for required segments
      const content = document.content;
      const requiredSegments = ['ISA', 'GS', 'ST', 'SE', 'GE', 'IEA'];
      
      for (const segment of requiredSegments) {
        if (!content.includes(segment + '*')) {
          logger.warn(`Missing required EDI segment: ${segment}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error validating EDI document:', error);
      return false;
    }
  }

  /**
   * Send EDI document to trading partner
   */
  async sendEDIDocument(document: EDIDocument, endpoint: string): Promise<boolean> {
    try {
      logger.info(`Sending EDI document ${document.transactionSetId} to ${endpoint}`);
      
      // In a real implementation, this would send via AS2, SFTP, or other EDI protocol
      // For now, just log the action
      logger.info('EDI document sent successfully (simulated)');
      
      return true;
    } catch (error) {
      logger.error('Error sending EDI document:', error);
      return false;
    }
  }

  /**
   * Generate unique transaction set ID
   */
  private generateTransactionSetId(): string {
    return 'TS' + Date.now().toString();
  }

  /**
   * Generate control number for EDI segments
   */
  private generateControlNumber(): string {
    return Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
  }

  /**
   * Format date for EDI (YYMMDD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
  }

  /**
   * Format time for EDI (HHMM)
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + minutes;
  }
}