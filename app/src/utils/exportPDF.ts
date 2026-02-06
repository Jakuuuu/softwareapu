import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Proyecto } from '../types';

// Add type definition for autoTable since it extends jsPDF
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

export const generarPDFPresupuesto = (proyecto: Proyecto) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const fecha = new Date().toLocaleDateString('es-ES');

    // --- HEADER ---
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('PRESUPUESTO DE OBRA', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(80);

    // Project Info - Left Column
    doc.text(`Proyecto: ${proyecto.nombre}`, 14, 30);
    doc.text(`Propietario: ${proyecto.propietario}`, 14, 36);
    doc.text(`Ubicación: ${proyecto.ubicacion}`, 14, 42);

    // Project Info - Right Column
    doc.text(`Fecha: ${fecha}`, 140, 30);
    doc.text(`Tipo: ${proyecto.tipoObra}`, 140, 36);

    // --- BODY (TABLE) ---
    const tableColumn = ["Código", "Descripción", "Und", "Cant", "P. Unitario", "Total"];
    const tableRows = proyecto.partidas.map(partida => [
        partida.codigo,
        partida.titulo,
        partida.unidadMedida,
        partida.cantidad,
        `$ ${partida.precioUnitario.toFixed(2)}`,
        `$ ${partida.precioTotal.toFixed(2)}`
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 20 }, // Codigo
            1: { cellWidth: 'auto' }, // Descripcion
            2: { cellWidth: 15, halign: 'center' }, // Und
            3: { cellWidth: 20, halign: 'right' }, // Cant
            4: { cellWidth: 30, halign: 'right' }, // PU
            5: { cellWidth: 30, halign: 'right' }  // Total
        }
    });

    // --- FOOTER (SUMMARY) ---
    const finalY = doc.lastAutoTable.finalY + 10;

    // Calculate Totals
    const totalDirecto = proyecto.partidas.reduce((sum, p) => sum + (p.costoDirecto * p.cantidad), 0);
    const adminAmount = totalDirecto * (proyecto.factoresGlobales.administracion / 100);
    const utilidadAmount = totalDirecto * (proyecto.factoresGlobales.utilidad / 100);
    const subtotal = totalDirecto + adminAmount + utilidadAmount;
    const ivaAmount = subtotal * (proyecto.factoresGlobales.iva / 100);
    const totalGeneral = subtotal + ivaAmount;

    // Draw Summary Box
    const summaryX = 120;
    const summaryWidth = 70;
    const lineHeight = 6;
    let currentY = finalY;

    // Function to draw line
    const drawSummaryLine = (label: string, value: number, isBold: boolean = false) => {
        doc.setFontSize(10);
        if (isBold) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');

        doc.text(label, summaryX, currentY);
        doc.text(`$ ${value.toFixed(2)}`, summaryX + summaryWidth, currentY, { align: 'right' });
        currentY += lineHeight;
    };

    drawSummaryLine('Costo Directo:', totalDirecto);
    drawSummaryLine(`Administración (${proyecto.factoresGlobales.administracion}%):`, adminAmount);
    drawSummaryLine(`Utilidad (${proyecto.factoresGlobales.utilidad}%):`, utilidadAmount);

    // Separator
    doc.line(summaryX, currentY - 4, summaryX + summaryWidth, currentY - 4);

    drawSummaryLine('Subtotal:', subtotal, true);
    drawSummaryLine(`IVA (${proyecto.factoresGlobales.iva}%):`, ivaAmount);

    // Final Total
    doc.setFillColor(41, 128, 185); // Primary Blue
    doc.rect(summaryX - 2, currentY - 4, summaryWidth + 4, 8, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GENERAL:', summaryX, currentY + 1.5);
    doc.text(`$ ${totalGeneral.toFixed(2)}`, summaryX + summaryWidth, currentY + 1.5, { align: 'right' });

    // Save
    doc.save(`${proyecto.nombre.replace(/ /g, '_')}_Presupuesto.pdf`);
};
