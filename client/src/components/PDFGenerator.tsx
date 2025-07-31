import React from 'react';
import jsPDF from 'jspdf';
// Logo will be embedded as base64 for PDF generation

interface PDFGeneratorProps {
  rug: any;
  isOpen: boolean;
  onClose: () => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ rug, isOpen, onClose }) => {
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up fonts and colors
    pdf.setFont('helvetica', 'normal');
    
    // Header with logo and date
    const currentDate = new Date().toISOString().split('T')[0];
    pdf.setFontSize(10);
    pdf.text(currentDate, pageWidth - 40, 15);
    
    // Main heading
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Eastern Mills Private Limited', 20, 20);
    
    // Sub heading
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Technical Description - TED', 20, 27);
    
    // Design name as header (no carpet number)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const designName = rug.designName || 'Untitled Design';
    pdf.text(designName, 20, 40);
    
    let yPosition = 55;
    
    // MATERIAL section - only show if materials exist
    const materials = rug.materials || [];
    if (materials.length > 0) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MATERIAL', 20, yPosition);
      yPosition += 8;
      
      // Material details table
      materials.forEach((material: any, index: number) => {
        if (material.name && material.name.trim()) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const materialType = material.type === 'warp' ? 'Warp' : 'Weft';
          const materialCategory = material.type === 'warp' ? 'Base material' : 'Surface material';
          
          pdf.text(`${materialType}:`, 25, yPosition);
          pdf.text(materialCategory, 60, yPosition);
          pdf.text(material.name, 110, yPosition);
          yPosition += 6;
        }
      });
      yPosition += 8;
    }
    
    // PRODUCT DETAILS section
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRODUCT DETAILS', 20, yPosition);
    yPosition += 8;
    
    const productDetails = [];
    
    // Specific fields as requested
    if (rug.designName) productDetails.push(['Design Name:', rug.designName]);
    if (rug.carpetNo) productDetails.push(['Carpet No.:', rug.carpetNo]);
    if (rug.construction) productDetails.push(['Construction:', rug.construction]);
    if (rug.quality) productDetails.push(['Quality:', rug.quality]);
    if (rug.color) productDetails.push(['Color:', rug.color]);
    if (rug.shadeCardNo) productDetails.push(['Shade Card No.:', rug.shadeCardNo]);
    if (rug.unfinishedGSM > 0) productDetails.push(['Unfinished GSM:', Math.round(rug.unfinishedGSM).toString()]);
    if (rug.finishedGSM > 0) productDetails.push(['Finished GSM:', Math.round(rug.finishedGSM).toString()]);
    if (rug.washed !== undefined) productDetails.push(['Washed Y/N:', rug.washed ? 'Y' : 'N']);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    productDetails.forEach(([label, value]) => {
      pdf.text(label, 25, yPosition);
      pdf.text(value, 80, yPosition);
      yPosition += 6;
    });
    
    if (productDetails.length > 0) yPosition += 8;
    
    // MATERIAL SPECIFICATIONS
    if (materials.length > 0) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MATERIAL SPECIFICATIONS', 20, yPosition);
      yPosition += 8;
      
      // Warp and Weft materials with GSM
      const warpMaterials = materials.filter(m => m.type === 'warp' && m.name);
      const weftMaterials = materials.filter(m => m.type === 'weft' && m.name);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      warpMaterials.forEach((material: any, index: number) => {
        pdf.text(`Warp ${index + 1}: ${material.name}`, 25, yPosition);
        if (material.consumption > 0) {
          pdf.text(`GSM: ${material.consumption.toFixed(2)}`, 120, yPosition);
        }
        yPosition += 6;
      });
      
      weftMaterials.forEach((material: any, index: number) => {
        pdf.text(`Weft ${index + 1}: ${material.name}`, 25, yPosition);
        if (material.consumption > 0) {
          pdf.text(`GSM: ${material.consumption.toFixed(2)}`, 120, yPosition);
        }
        yPosition += 6;
      });
      
      // Type of Dyeing
      if (rug.typeOfDyeing) {
        pdf.text(`Type of Dyeing: ${rug.typeOfDyeing}`, 25, yPosition);
        yPosition += 6;
      }
      
      // Summary GSM Analysis
      pdf.setFont('helvetica', 'bold');
      pdf.text('GSM Analysis Summary:', 25, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      
      const totalMaterialGSM = materials.reduce((sum, m) => sum + (m.consumption || 0), 0);
      if (totalMaterialGSM > 0) {
        pdf.text(`Total Material GSM: ${totalMaterialGSM.toFixed(2)}`, 30, yPosition);
        yPosition += 5;
      }
      if (rug.pileGSM > 0) {
        pdf.text(`Pile GSM: ${rug.pileGSM}`, 30, yPosition);
        yPosition += 5;
      }
      
      yPosition += 8;
    }
    
    // CONSTRUCTION SPECIFICATIONS
    const constructionData = [];
    if (rug.pileGSM > 0) constructionData.push(['Pile GSM:', rug.pileGSM.toString()]);
    if (rug.warpIn6Inches) constructionData.push(['Warp in 6 inches:', rug.warpIn6Inches]);
    if (rug.weftIn6Inches) constructionData.push(['Weft in 6 inches:', rug.weftIn6Inches]);
    if (rug.pileHeightMM > 0) constructionData.push(['Pile Height in MM:', `${rug.pileHeightMM} mm`]);
    if (rug.totalThicknessMM > 0) constructionData.push(['Total thickness in MM:', `${rug.totalThicknessMM} mm`]);
    
    if (constructionData.length > 0) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONSTRUCTION SPECIFICATIONS', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      constructionData.forEach(([label, value]) => {
        pdf.text(label, 25, yPosition);
        pdf.text(value, 90, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    }
    
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // EDGE DETAILS
    const edgeData = [];
    if (rug.edgeLongerSide) edgeData.push(['Longer side:', rug.edgeLongerSide]);
    if (rug.edgeShortSide) edgeData.push(['Short side:', rug.edgeShortSide]);
    if (rug.fringesHemLength) edgeData.push(['Fringes/Hem length:', rug.fringesHemLength]);
    if (rug.fringesHemMaterial) edgeData.push(['Fringes/Hem Material:', rug.fringesHemMaterial]);
    
    if (edgeData.length > 0) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EDGE DETAILS', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      edgeData.forEach(([label, value]) => {
        pdf.text(label, 25, yPosition);
        pdf.text(value, 90, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    }
    
    // PROCESS FLOW
    const processFlow = rug.processFlow || [];
    if (processFlow.length > 0) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROCESS FLOW', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      processFlow.forEach((process: string, index: number) => {
        pdf.text(`${index + 1}. ${process}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.text('© Produced by Eastern Mills Limited ' + new Date().getFullYear(), 20, pageHeight - 15);
    pdf.text(`Page: 1 of 1`, pageWidth - 40, pageHeight - 15);
    
    // Save the PDF
    const fileName = `${rug.designName || 'rug'}_${rug.carpetNo || 'technical'}_description.pdf`;
    pdf.save(fileName);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-6">Download {rug.designName || 'Rug'} TED</h3>
        
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;