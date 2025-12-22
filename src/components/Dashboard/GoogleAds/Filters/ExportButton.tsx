"use client";

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface ExportButtonProps {
  campaigns: any[];
  metrics: any;
  performanceData: any[];
}

const ExportButton: React.FC<ExportButtonProps> = ({
  campaigns,
  metrics,
  performanceData
}) => {
  const { t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export to CSV
  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Create CSV content
      const headers = ['Campaign ID', 'Name', 'Type', 'Status', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'Spend', 'ROAS'];
      const rows = campaigns.map(campaign => [
        campaign.id,
        `"${campaign.name}"`, // Quote to handle commas in names
        campaign.type,
        campaign.status,
        campaign.impressions || 0,
        campaign.clicks || 0,
        (campaign.ctr || 0).toFixed(2),
        campaign.conversions || 0,
        (campaign.cost || 0).toFixed(2),
        (campaign.roas || 0).toFixed(2)
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `campaigns_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Excel (TSV format for Excel compatibility)
  const exportToExcel = () => {
    setIsExporting(true);
    
    try {
      // Create TSV content (Excel-compatible)
      const headers = ['Campaign ID', 'Name', 'Type', 'Status', 'Impressions', 'Clicks', 'CTR (%)', 'Conversions', 'Spend ($)', 'ROAS'];
      const rows = campaigns.map(campaign => [
        campaign.id,
        campaign.name,
        campaign.type,
        campaign.status,
        campaign.impressions || 0,
        campaign.clicks || 0,
        (campaign.ctr || 0).toFixed(2),
        campaign.conversions || 0,
        (campaign.cost || 0).toFixed(2),
        (campaign.roas || 0).toFixed(2)
      ]);
      
      const tsvContent = [
        headers.join('\t'),
        ...rows.map(row => row.join('\t'))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `campaigns_export_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create PDF content using HTML
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Campaign Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #7c3aed; text-align: center; }
    .summary { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
    .summary-item { display: inline-block; margin: 10px 20px; }
    .summary-label { font-weight: bold; color: #6b7280; }
    .summary-value { font-size: 24px; color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background: #7c3aed; color: white; }
    tr:nth-child(even) { background: #f9fafb; }
    .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Google Ads Campaign Report</h1>
  <p style="text-align: center; color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
  
  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Total Campaigns</div>
      <div class="summary-value">${campaigns.length}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total Impressions</div>
      <div class="summary-value">${(metrics.impressions || 0).toLocaleString()}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total Clicks</div>
      <div class="summary-value">${(metrics.clicks || 0).toLocaleString()}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total Conversions</div>
      <div class="summary-value">${(metrics.conversions || 0).toLocaleString()}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total Spend</div>
      <div class="summary-value">$${(metrics.cost || 0).toLocaleString()}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Average ROAS</div>
      <div class="summary-value">${(metrics.roas || 0).toFixed(2)}</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Campaign Name</th>
        <th>Type</th>
        <th>Status</th>
        <th>Impressions</th>
        <th>Clicks</th>
        <th>CTR</th>
        <th>Conversions</th>
        <th>Spend</th>
        <th>ROAS</th>
      </tr>
    </thead>
    <tbody>
      ${campaigns.map(campaign => `
        <tr>
          <td>${campaign.name}</td>
          <td>${campaign.type}</td>
          <td>${campaign.status}</td>
          <td>${(campaign.impressions || 0).toLocaleString()}</td>
          <td>${(campaign.clicks || 0).toLocaleString()}</td>
          <td>${(campaign.ctr || 0).toFixed(2)}%</td>
          <td>${(campaign.conversions || 0).toLocaleString()}</td>
          <td>$${(campaign.cost || 0).toFixed(2)}</td>
          <td>${(campaign.roas || 0).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>© 2024 Google Ads AI Platform - All Rights Reserved</p>
  </div>
</body>
</html>
      `;
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `campaigns_report_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsOpen(false);
      
      // Open in new window for printing as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900/50 rounded-lg text-purple-200 text-sm transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{isRTL ? 'تصدير' : 'Export'}</span>
      </button>

      {/* Export Options Dropdown */}
      {isOpen && !isExporting && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full mt-2 right-0 w-56 bg-[#060010] border border-purple-900/50 rounded-xl shadow-2xl shadow-purple-900/20 z-50 backdrop-blur-xl overflow-hidden">
            <div className="p-2">
              {/* CSV */}
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-purple-900/20 hover:text-white rounded-lg transition-all"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium">
                    {isRTL ? 'CSV ملف' : 'Export as CSV'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? 'جداول بيانات' : 'Spreadsheet format'}
                  </div>
                </div>
              </button>
              
              {/* Excel */}
              <button
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-purple-900/20 hover:text-white rounded-lg transition-all mt-1"
              >
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium">
                    {isRTL ? 'Excel ملف' : 'Export as Excel'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? 'Microsoft Excel' : 'Microsoft Excel format'}
                  </div>
                </div>
              </button>
              
              {/* PDF */}
              <button
                onClick={exportToPDF}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-purple-900/20 hover:text-white rounded-lg transition-all mt-1"
              >
                <FileImage className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm font-medium">
                    {isRTL ? 'PDF ملف' : 'Export as PDF'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? 'تقرير PDF' : 'Printable PDF report'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

