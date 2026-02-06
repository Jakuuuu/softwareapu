import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Proyecto } from '../types';

export const generarPDFPresupuesto = (proyecto: Proyecto) => {
    // Explicit options to ensure correct initialization
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Explicitly cast to any to avoid type conflicts with jspdf-autotable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docWithAutoTable = doc as any;

    const fecha = new Date().toLocaleDateString('es-ES');

    // Helper for currency formatting with validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = (n: any) => typeof n === 'number' && !isNaN(n);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fmt = (num: any) => `$ ${isValid(num) ? Number(num).toFixed(2) : '0.00'}`;

    // Safety check for empty project
    if (!proyecto.partidas || proyecto.partidas.length === 0) {
        doc.setFontSize(14);
        doc.text('No hay partidas registradas en este proyecto.', 20, 30);
        doc.save(`${(proyecto.nombre || 'Presupuesto').replace(/ /g, '_')}.pdf`);
        return;
    }

    // Iterate through each Partida to create individual APU sheets
    proyecto.partidas.forEach((partida, index) => {
        if (index > 0) doc.addPage();

        const startY = 15;
        let currentY = startY;

        // --- HEADER (Project & Partida Info) ---
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0); // Force black text

        // Project Details
        doc.setFont('helvetica', 'bold');
        doc.text('PROYECTO:', 14, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(proyecto.nombre || 'Sin Nombre', 35, currentY);

        doc.setFont('helvetica', 'bold');
        doc.text('FECHA:', 160, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(fecha, 175, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('UBICACIÓN:', 14, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(proyecto.ubicacion || 'Sin Ubicación', 35, currentY);
        currentY += 8;

        // Partida Title Box
        doc.setFillColor(240, 240, 240);
        doc.rect(14, currentY, 182, 18, 'F');
        doc.setDrawColor(200);
        doc.rect(14, currentY, 182, 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`PARTIDA: ${partida.codigo || 'S/C'}`, 16, currentY + 5);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const titulo = partida.titulo ? partida.titulo.toUpperCase() : 'SIN DESCRIPCIÓN';
        const splitTitle = doc.splitTextToSize(titulo, 178);
        doc.text(splitTitle, 16, currentY + 10);

        currentY += 20;

        // Partida Details Line
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('UNIDAD:', 14, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(partida.unidadMedida || 'N/A', 28, currentY);

        doc.setFont('helvetica', 'bold');
        doc.text('CANTIDAD:', 60, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(isValid(partida.cantidad) ? partida.cantidad.toString() : '0', 78, currentY);

        doc.setFont('helvetica', 'bold');
        doc.text('RENDIMIENTO:', 120, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${isValid(partida.rendimiento) ? partida.rendimiento.toFixed(2) : '0'} / día`, 145, currentY);

        currentY += 6;

        // --- SECTIONS CONFIG ---
        // Explicitly typed as any to avoid 'UserOptions' import issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableTheme: any = {
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: 200 },
            bodyStyles: { fontSize: 8, textColor: 0 },
            footStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 8, fontStyle: 'bold' },
            theme: 'plain',
            styles: { cellPadding: 1 },
        };

        // 1. MATERIALES
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('1. MATERIALES', 14, currentY + 4);

        const matBody = (partida.materiales || []).map(m => {
            const precio = m.precioUnitario || 0;
            const cant = m.cantidad || 0;
            const desp = m.desperdicio || 0;
            const sub = (precio * cant) * (1 + desp / 100);

            return [
                m.recursoId || '-',
                m.nombre || 'Material',
                m.unidad || 'u',
                cant.toFixed(4),
                `${desp}%`,
                fmt(precio),
                fmt(sub)
            ];
        });

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Código', 'Descripción', 'Unidad', 'Cant.', 'Desp.', 'Costo', 'Total']],
            body: matBody,
            ...tableTheme,
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 15, halign: 'right' },
                4: { cellWidth: 15, halign: 'right' },
                5: { cellWidth: 20, halign: 'right' },
                6: { cellWidth: 20, halign: 'right' }
            },
            foot: [['', '', '', '', '', 'Total Materiales:', fmt(partida.costoMateriales || 0)]]
        });

        // Update currentY using the docWithAutoTable cast
        currentY = docWithAutoTable.lastAutoTable.finalY + 5;

        // 2. EQUIPOS
        doc.text('2. EQUIPOS', 14, currentY + 4);

        const eqBody = (partida.equipos || []).map(e => {
            const costoH = e.costoHora || 0;
            const horas = e.horasPorDia || 0;
            const cant = e.cantidad || 0;
            const sub = (costoH * horas * cant);

            return [
                e.recursoId || '-',
                e.nombre || 'Equipo',
                cant.toFixed(4),
                fmt(costoH),
                `$ ${sub.toFixed(2)}`,
                fmt(e.subtotal || 0)
            ];
        });

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Código', 'Descripción', 'Cant.', 'Costo/H', 'Costo Diario', 'Total Unit.']],
            body: eqBody,
            ...tableTheme,
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'right' },
                3: { cellWidth: 20, halign: 'right' },
                4: { cellWidth: 20, halign: 'right' },
                5: { cellWidth: 20, halign: 'right' }
            },
            foot: [['', '', '', '', 'Total Equipos:', fmt(partida.costoEquipos || 0)]]
        });

        currentY = docWithAutoTable.lastAutoTable.finalY + 5;

        // 3. MANO DE OBRA
        doc.text('3. MANO DE OBRA', 14, currentY + 4);

        const moBody = (partida.manoObra || []).map(m => {
            const jornal = m.jornal || 0;
            const cant = m.cantidad || 0;
            return [
                m.recursoId || '-',
                m.nombre || 'Obrero',
                cant.toFixed(2),
                fmt(jornal),
                fmt(jornal * cant)
            ];
        });

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Código', 'Descripción', 'Cant.', 'Jornal', 'Total Jornal']],
            body: moBody,
            ...tableTheme,
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'right' },
                3: { cellWidth: 20, halign: 'right' },
                4: { cellWidth: 20, halign: 'right' }
            },
            foot: [['', '', '', 'Total Mano Obra:', fmt(partida.costoManoObra || 0)]]
        });

        currentY = docWithAutoTable.lastAutoTable.finalY + 10;

        // --- APU SUMMARY FOOTER ---
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }

        const summaryX = 110;
        const col1 = summaryX;
        const col2 = summaryX + 60;
        const lineHeight = 5;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const drawRow = (label: string, val: number, bold: boolean = false) => {
            if (!isValid(val)) val = 0;
            if (bold) doc.setFont('helvetica', 'bold');
            else doc.setFont('helvetica', 'normal');
            doc.text(label, col1, currentY);
            doc.text(fmt(val), col2, currentY, { align: 'right' });
            currentY += lineHeight;
        };

        // Box around summary
        doc.setDrawColor(200);
        doc.setFillColor(250, 250, 250);
        doc.rect(col1 - 5, currentY - 5, 80, 45, 'FD');

        const directo = partida.costoDirecto || 0;
        const adminPct = proyecto.factoresGlobales.administracion || 0;
        const utilPct = proyecto.factoresGlobales.utilidad || 0;
        const ivaPct = proyecto.factoresGlobales.iva || 0;

        drawRow('Costo Directo:', directo);
        drawRow(`Administración (${adminPct}%):`, directo * (adminPct / 100));
        drawRow(`Utilidad (${utilPct}%):`, directo * (utilPct / 100));

        doc.line(col1, currentY - 2, col2, currentY - 2);

        const subtotal = directo * (1 + (adminPct + utilPct) / 100);
        drawRow('Subtotal Unitario:', subtotal, true);

        drawRow(`IVA (${ivaPct}%):`, subtotal * (ivaPct / 100));

        // Final PU
        currentY += 2;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const pu = partida.precioUnitario || 0;
        doc.text('PRECIO UNITARIO:', col1, currentY);
        doc.text(fmt(pu), col2, currentY, { align: 'right' });
    });


    // --- FINAL SUMMARY PAGE ---
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DEL PRESUPUESTO', 105, 20, { align: 'center' });

    // Summary Table
    const summaryRows = proyecto.partidas.map(p => [
        p.codigo || '-',
        p.titulo || '-',
        p.unidadMedida || '-',
        isValid(p.cantidad) ? p.cantidad.toString() : '0',
        fmt(p.precioUnitario || 0),
        fmt(p.precioTotal || 0)
    ]);

    autoTable(doc, {
        startY: 30,
        head: [['Código', 'Descripción', 'Und', 'Cant', 'P. Unitario', 'Total']],
        body: summaryRows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
            0: { cellWidth: 20 },
            4: { halign: 'right' },
            5: { halign: 'right' }
        }
    });

    const finalY = docWithAutoTable.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`TOTAL PRESUPUESTO:`, 140, finalY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const totalP = proyecto.partidas.reduce((sum, p) => sum + (p.precioTotal || 0), 0);
    doc.text(fmt(totalP), 190, finalY, { align: 'right' });

    doc.save(`${(proyecto.nombre || 'Presupuesto').replace(/ /g, '_')}_APU_Detallado.pdf`);
};
