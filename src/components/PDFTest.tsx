import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PDFTest() {
  const generateTestPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Test PDF Report', 20, 20);

    doc.setFontSize(12);
    doc.text('Hi! This is a test PDF.', 20, 40);
    doc.text('PDF generation is working correctly.', 20, 50);

    autoTable(doc, {
      head: [['Column 1', 'Column 2', 'Column 3']],
      body: [
        ['Data 1', 'Data 2', 'Data 3'],
        ['Test A', 'Test B', 'Test C'],
        ['Sample X', 'Sample Y', 'Sample Z'],
      ],
      startY: 60,
    });

    doc.save('test-report.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>PDF Generation Test</h3>
      <button
        onClick={generateTestPDF}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          color: 'white',
          backgroundColor: '#28a745',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Generate Test PDF
      </button>
    </div>
  );
}
