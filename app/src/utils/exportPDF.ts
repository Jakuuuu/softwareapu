import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Proyecto } from '../types';

export const generarPDFPresupuesto = (proyecto: Proyecto) => {
    // 1. Initialize Document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Helper for formatting currency
    const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format;
    const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    // 2. HEADER
    // Logo text/placeholder
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.text('CALCULADORA CONTROL INTEGRAL', 105, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESUPUESTO DE OBRA', 105, 23, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 26, 196, 26);

    // 3. PROJECT INFO (Grid Layout)
    const infoY = 32;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    // Column 1
    doc.text('PROYECTO:', 14, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(proyecto.nombre || 'Sin Nombre', 35, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text('UBICACIÓN:', 14, infoY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(proyecto.ubicacion || 'Sin Ubicación', 35, infoY + 6);

    // Column 2
    doc.setFont('helvetica', 'bold');
    doc.text('PROPIETARIO:', 110, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(proyecto.propietario || '---', 135, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA:', 110, infoY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(now, 135, infoY + 6);

    // 4. GLOBAL FACTORS
    const factorsY = infoY + 14;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, factorsY, 182, 12, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // Slate 600

    const gf = proyecto.factoresGlobales;
    const factorsText = `FACTORES APLICADOS:   IVA: ${gf.iva}%    |    Utilidad: ${gf.utilidad}%    |    Administración: ${gf.administracion}%    |    FCAS: ${gf.fcas}%`;
    doc.text(factorsText, 105, factorsY + 7, { align: 'center' });

    // 5. MAIN TABLE (Budget Summary)
    const tableBody = (proyecto.partidas || []).map(p => [
        p.codigo || '-',
        p.titulo || 'Sin Descripción',
        p.unidadMedida || '-',
        p.cantidad || 0,
        fmt(p.precioUnitario || 0),
        fmt(p.precioTotal || 0)
    ]);

    autoTable(doc, {
        startY: factorsY + 16,
        head: [['CÓDIGO', 'DESCRIPCIÓN', 'UND', 'CANT', 'P. UNITARIO', 'TOTAL']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: [30, 58, 138], // Blue 900
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: 50
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' }, // Código
            1: { cellWidth: 'auto' }, // Descripción
            2: { cellWidth: 15, halign: 'center' }, // UND
            3: { cellWidth: 20, halign: 'center' }, // CANT
            4: { cellWidth: 30, halign: 'right' }, // PU
            5: { cellWidth: 35, halign: 'right', fontStyle: 'bold' } // TOTAL
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        margin: { top: 30, left: 14, right: 14 }
    });

    // 6. ECONOMIC SUMMARY (Footer)
    // Cast to any to access finalY
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Check if we need a new page
    if (finalY > 240) {
        doc.addPage();
    }

    // Calculate totals
    const totalMateriales = proyecto.partidas.reduce((sum, p) => sum + (p.costoMateriales * p.cantidad), 0);
    const totalManoObra = proyecto.partidas.reduce((sum, p) => sum + (p.costoManoObra * p.cantidad), 0);
    const totalEquipos = proyecto.partidas.reduce((sum, p) => sum + (p.costoEquipos * p.cantidad), 0);

    const costoDirectoTotal = totalMateriales + totalManoObra + totalEquipos;
    const adminTotal = costoDirectoTotal * (gf.administracion / 100);
    const utilidadTotal = costoDirectoTotal * (gf.utilidad / 100);
    const subtotal = costoDirectoTotal + adminTotal + utilidadTotal;
    const ivaTotal = subtotal * (gf.iva / 100);
    const granTotal = subtotal + ivaTotal;

    const summaryX = 110;
    const summaryHeight = 60; // Approximate height of the summary box

    // Check if we need a new page for the summary
    let sumY = finalY;
    if (sumY + summaryHeight > 270) { // 270 is approx bottom margin considering footer
        doc.addPage();
        sumY = 20; // Reset Y for new page
    }

    // Draw Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(255, 255, 255);
    doc.rect(summaryX - 5, sumY - 5, 90, 60);

    doc.setFontSize(9);
    const drawRow = (label: string, value: number, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(0);
        doc.text(label, summaryX, sumY);
        doc.text(fmt(value), summaryX + 80, sumY, { align: 'right' });
        sumY += 6;
    };

    drawRow('Materiales:', totalMateriales);
    drawRow('Mano de Obra:', totalManoObra);
    drawRow('Equipos:', totalEquipos);

    doc.setDrawColor(150);
    doc.line(summaryX, sumY - 2, summaryX + 80, sumY - 2);
    sumY += 2;

    drawRow('COSTO DIRECTO:', costoDirectoTotal, true);
    sumY += 2;

    drawRow(`Administración (${gf.administracion}%):`, adminTotal);
    drawRow(`Utilidad (${gf.utilidad}%):`, utilidadTotal);

    doc.line(summaryX, sumY - 2, summaryX + 80, sumY - 2);
    sumY += 2;

    drawRow('SUBTOTAL:', subtotal, true);
    drawRow(`IVA (${gf.iva}%):`, ivaTotal);

    sumY += 4;
    doc.setFillColor(30, 58, 138); // Blue 900 bg
    doc.rect(summaryX - 5, sumY - 6, 90, 12, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PROYECTO:', summaryX, sumY + 1);
    doc.text(fmt(granTotal), summaryX + 80, sumY + 1, { align: 'right' });

    // 7. FOOTER (Page Numbers)
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, 196, 285, { align: 'right' });
        doc.text(`Generado el: ${now}`, 14, 285);
    }

    // 8. SAVE (Mobile Compatible)
    const filename = `Presupuesto_${(proyecto.nombre || 'Proyecto').replace(/\s+/g, '_')}.pdf`;

    try {
        // Method 1: Standard save (Works on desktop/some mobiles)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
            // IE/Edge legacy
            doc.save(filename);
            return;
        }

        // Method 2: Blob + Link (Robust for Mobile/WebView)
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.target = '_blank'; // Required for some browsers to trigger download

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error("Download failed, trying fallback:", error);
        // Fallback: Direct save attempt
        doc.save(filename);
        alert("Si la descarga no inicia, por favor revisa los permisos de tu navegador.");
    }
};
