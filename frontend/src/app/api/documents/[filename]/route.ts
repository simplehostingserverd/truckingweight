/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

interface RouteParams {
  params: {
    filename: string;
  };
}

/**
 * GET /api/documents/[filename]
 * Generate realistic PDF documents for compliance demonstration
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = params;

    // Generate realistic PDF content based on filename
    const pdfContent = await generatePDFContent(filename);

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating PDF document:', error);
    return NextResponse.json({ error: 'Failed to generate PDF document' }, { status: 500 });
  }
}

function generatePDFContent(filename: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate content based on filename
      if (filename.includes('hos-log')) {
        generateHOSLogPDF(doc);
      } else if (filename.includes('dvir')) {
        generateDVIRPDF(doc);
      } else if (filename.includes('safety-cert')) {
        generateSafetyCertificatePDF(doc);
      } else if (filename.includes('dot-audit')) {
        generateDOTAuditPDF(doc);
      } else if (filename.includes('hazmat-cert')) {
        generateHazmatCertPDF(doc);
      } else {
        generateGenericDocumentPDF(doc, filename);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateHOSLogPDF(doc: PDFKit.PDFDocument) {
  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('HOURS OF SERVICE LOG', { align: 'center' });
  doc.moveDown();

  // Driver Information
  doc.fontSize(12).font('Helvetica-Bold').text('DRIVER INFORMATION', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('Driver: Michael Rodriguez');
  doc.text('CDL License: CDL-IL-847291');
  doc.text('Vehicle: Freightliner FL-2847');
  doc.text('Date: January 20, 2025');
  doc.moveDown();

  // Duty Status Record
  doc.font('Helvetica-Bold').text('DUTY STATUS RECORD', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('06:00 - ON DUTY (NOT DRIVING) - Pre-trip inspection');
  doc.text('07:00 - DRIVING - Departed Chicago Distribution Center');
  doc.text('15:00 - OFF DUTY - Arrived Denver Terminal');
  doc.text('15:30 - SLEEPER BERTH - Rest period');
  doc.moveDown();

  // Total Hours
  doc.font('Helvetica-Bold').text('TOTAL HOURS', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('Driving: 8 hours');
  doc.text('On Duty: 9.5 hours');
  doc.text('Off Duty: 14.5 hours');
  doc.moveDown();

  // Certification
  doc.font('Helvetica-Bold').text('CERTIFICATION', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text(
    'I hereby certify that my data entries and my record of duty status for this date are true and correct.'
  );
  doc.moveDown();
  doc.text('Driver Signature: Michael Rodriguez');
  doc.text('Date: 01/20/2025');
  doc.moveDown();

  // ELD Information
  doc.font('Helvetica-Bold').text('ELD DEVICE INFORMATION', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('ELD Device: Geotab GO9 Fleet Management');
  doc.text('Device ID: GEOTAB-GO9-FL2847');
  doc.text('Odometer: 287,456 miles');
  doc.moveDown();

  // Compliance Status
  doc.font('Helvetica-Bold').text('DOT COMPLIANCE: SATISFACTORY', { align: 'center' });
  doc.font('Helvetica').text('No violations recorded.', { align: 'center' });
}

function generateDVIRPDF(doc: PDFKit.PDFDocument) {
  // Header
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('DRIVER VEHICLE INSPECTION REPORT (DVIR)', { align: 'center' });
  doc.moveDown();

  // Vehicle Information
  doc.fontSize(12).font('Helvetica-Bold').text('VEHICLE INFORMATION', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('Vehicle: Freightliner FL-2847 (Cascadia Evolution)');
  doc.text('Driver: Michael Rodriguez');
  doc.text('Date: January 20, 2025');
  doc.text('Inspection Type: Pre-Trip');
  doc.moveDown();

  // Inspection Results
  doc.font('Helvetica-Bold').text('INSPECTION RESULTS', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('✓ Engine Compartment - Cummins X15 Engine');
  doc.text('✓ Air Brake System - Bendix Components');
  doc.text('✓ Tires & Wheels - Michelin XDA Energy');
  doc.text('✓ Lighting System - LED Headlights & Markers');
  doc.text('✓ Coupling System - Holland FW35 Fifth Wheel');
  doc.text('✓ Steering System - Satisfactory');
  doc.text('✓ Suspension - Satisfactory');
  doc.text('✓ Exhaust System - Satisfactory');
  doc.moveDown();

  // Defects
  doc.font('Helvetica-Bold').text('DEFECTS FOUND: None', { underline: true });
  doc.moveDown();

  // Overall Status
  doc.fontSize(14).font('Helvetica-Bold').text('OVERALL STATUS: SATISFACTORY', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Vehicle is safe for operation.', { align: 'center' });
  doc.moveDown();

  // Signatures
  doc.font('Helvetica-Bold').text('CERTIFICATION', { underline: true });
  doc.moveDown(0.5);
  doc.font('Helvetica');
  doc.text('Driver Signature: Michael Rodriguez');
  doc.text('Date: 01/20/2025');
  doc.text('Location: Premier Freight Solutions - Chicago Distribution Center');
  doc.moveDown();
  doc.text('Mechanic Review: N/A (No defects found)');
  doc.text('Next Inspection Due: 01/21/2025');
}

function generateSafetyCertificatePDF(doc: PDFKit.PDFDocument) {
  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('SAFETY TRAINING CERTIFICATE', { align: 'center' });
  doc.moveDown();
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('ADVANCED DEFENSIVE DRIVING CERTIFICATION', { align: 'center' });
  doc.moveDown(2);

  // Certification Statement
  doc.fontSize(12).font('Helvetica').text('This certifies that:', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).font('Helvetica-Bold').text('MICHAEL RODRIGUEZ', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('CDL License: CDL-IL-847291', { align: 'center' });
  doc.moveDown(2);

  // Course Information
  doc.font('Helvetica').text('Has successfully completed the Advanced Defensive Driving Course');
  doc.text('conducted by Premier Freight Solutions Safety Department');
  doc.moveDown();

  // Course Details
  doc.font('Helvetica-Bold').text('Course Details:');
  doc.font('Helvetica');
  doc.text('• 40-hour comprehensive training program');
  doc.text('• Hazard recognition and avoidance');
  doc.text('• Emergency response procedures');
  doc.text('• Accident prevention techniques');
  doc.text('• DOT safety regulations compliance');
  doc.moveDown();

  // Results
  doc.font('Helvetica-Bold').text('Final Score: 98/100');
  doc.font('Helvetica');
  doc.text('Completion Date: December 15, 2024');
  doc.text('Expiration Date: December 15, 2025');
  doc.moveDown();
  doc.text('Certificate Number: ADC-2024-FL2847');
  doc.moveDown(2);

  // Authorization
  doc.text('Authorized by:');
  doc.font('Helvetica-Bold').text('Sarah Johnson, Safety Director');
  doc.font('Helvetica').text('Premier Freight Solutions');
  doc.moveDown();
  doc.text('This certificate meets all DOT requirements for professional driver safety training.');
}

function generateDOTAuditPDF(doc: PDFKit.PDFDocument) {
  doc.fontSize(18).font('Helvetica-Bold').text('DEPARTMENT OF TRANSPORTATION', { align: 'center' });
  doc.text('SAFETY AUDIT REPORT', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica-Bold').text('COMPANY INFORMATION');
  doc.font('Helvetica');
  doc.text('Company: Premier Freight Solutions');
  doc.text('DOT Number: 12345678');
  doc.text('Address: 2847 Industrial Blvd, Chicago, IL 60601');
  doc.moveDown();

  doc.font('Helvetica-Bold').text('AUDIT INFORMATION');
  doc.font('Helvetica');
  doc.text('Audit Date: December 1, 2024');
  doc.text('Audit Type: Annual Safety Review');
  doc.text('Auditor: DOT Inspector James Wilson');
  doc.moveDown();

  doc.font('Helvetica-Bold').text('AUDIT RESULTS');
  doc.font('Helvetica');
  doc.text('Driver Qualifications: SATISFACTORY');
  doc.text('Vehicle Maintenance: SATISFACTORY');
  doc.text('Hours of Service: SATISFACTORY');
  doc.text('Safety Management: SATISFACTORY');
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('OVERALL RATING: SATISFACTORY', { align: 'center' });
}

function generateHazmatCertPDF(doc: PDFKit.PDFDocument) {
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('HAZARDOUS MATERIALS TRANSPORTATION CERTIFICATE', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica-Bold').text('DRIVER INFORMATION');
  doc.font('Helvetica');
  doc.text('Driver: Jennifer Chen');
  doc.text('CDL License: CDL-IL-394756');
  doc.text('Vehicle Assignment: Peterbilt PB-3947');
  doc.moveDown();

  doc.font('Helvetica-Bold').text('CERTIFICATION DETAILS');
  doc.font('Helvetica');
  doc.text('Course: Hazmat Transportation Safety');
  doc.text('Duration: 32 hours');
  doc.text('Training Provider: Premier Freight Solutions');
  doc.moveDown();

  doc.font('Helvetica-Bold').text('EXAMINATION RESULTS');
  doc.font('Helvetica');
  doc.text('Written Test: 94/100');
  doc.text('Practical Assessment: 96/100');
  doc.text('Overall Score: 95/100');
  doc.moveDown();

  doc.text('Certificate Number: HAZMAT-2024-PB3947');
  doc.text('Issue Date: November 10, 2024');
  doc.text('Expiration Date: November 10, 2026');
}

function generateGenericDocumentPDF(doc: PDFKit.PDFDocument, filename: string) {
  doc.fontSize(18).font('Helvetica-Bold').text('COMPLIANCE DOCUMENT', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica');
  doc.text(`Document: ${filename}`);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`);
  doc.text('Company: Premier Freight Solutions');
  doc.moveDown();

  doc.text('This is a professional compliance document generated for');
  doc.text('investor demonstration purposes.');
  doc.moveDown();

  doc.text(`Document ID: ${filename.replace('.pdf', '').toUpperCase()}`);
  doc.text('Status: Active');
  doc.text('Classification: DOT Compliant');
}
