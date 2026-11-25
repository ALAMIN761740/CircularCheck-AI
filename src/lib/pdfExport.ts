import { jsPDF } from 'jspdf';
import type { ScanAnalysisResult } from '../types/circular';

export function exportReportToPdf(report: ScanAnalysisResult): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 44;
  const maxWidth = pageWidth - margin * 2;
  let y = 48;

  const ensureSpace = (needed: number) => {
    if (y + needed > 780) {
      doc.addPage();
      y = 48;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('CircularCheck AI — Verification Report', margin, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Report ID: ${report.id}   |   Input: ${report.inputType.toUpperCase()}   |   Generated: ${new Date(
      report.createdAt || Date.now()
    ).toLocaleString()}`,
    margin,
    y
  );
  y += 22;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Risk summary banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Risk Score: ${report.riskScore}/100 (${report.riskLevel} Risk Indicators)`,
    margin,
    y
  );
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`Verification Status: ${report.verificationStatus}`, margin, y);
  y += 22;

  // Executive summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Analysis Summary', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(report.analysisSummary, maxWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 16;

  // Extracted details
  ensureSpace(140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Extracted Circular Information', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const fields: [string, string][] = [
    ['Organization', report.organizationName],
    ['Job Title', report.jobTitle],
    ['Salary', report.salary],
    ['Deadline', report.applicationDeadline],
    ['Application Fee', report.applicationFee],
    ['Payment Method', report.paymentMethod],
    ['Email', report.emailAddress],
    ['Website', report.websiteUrl],
    ['Contact', report.contactInformation],
  ];
  for (const [label, val] of fields) {
    ensureSpace(18);
    const line = `${label}: ${val || 'Not specified'}`;
    const wrapped = doc.splitTextToSize(line, maxWidth);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 13 + 3;
  }
  y += 12;

  // Findings
  ensureSpace(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Detected Risk Indicators (${report.findings.length})`, margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  if (report.findings.length === 0) {
    doc.text('No major risk indicators detected by automated checks.', margin, y);
    y += 16;
  } else {
    for (const f of report.findings) {
      ensureSpace(48);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${f.severity}] ${f.title} (${f.category})`, margin, y);
      y += 13;
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(
        `${f.description} Evidence: ${f.evidence}`,
        maxWidth
      );
      doc.text(descLines, margin, y);
      y += descLines.length * 13 + 8;
    }
  }

  // Recommendations
  ensureSpace(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Recommended Verification Actions', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  for (const rec of report.recommendations) {
    ensureSpace(24);
    const lines = doc.splitTextToSize(`- ${rec}`, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 4;
  }

  y += 14;
  ensureSpace(40);
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const disclaimer = doc.splitTextToSize(
    'Disclaimer: CircularCheck AI provides automated risk indicators and verification assistance. Always confirm directly with the employer’s official portal before paying fees or sharing sensitive documents.',
    maxWidth
  );
  doc.text(disclaimer, margin, y);

  doc.save(`CircularCheck-Report-${report.id}.pdf`);
}
