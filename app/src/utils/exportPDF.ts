import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Proyecto, Partida } from '../types';

interface ResourceSummary {
    nombre: string;
    unidad: string;
    cantidadTotal: number;
    costoTotalUsd: number;
}

const aggregateResources = (partidas: Partida[]) => {
    const materiales: Record<string, ResourceSummary> = {};
    const manoObra: Record<string, ResourceSummary> = {};
    const equipos: Record<string, ResourceSummary> = {};

    partidas.forEach(p => {
        const partidaCantidad = p.cantidad || 0;

        // Materiales
        p.materiales.forEach(m => {
            const key = m.nombre;
            if (!materiales[key]) {
                materiales[key] = {
                    nombre: m.nombre,
                    unidad: m.unidad,
                    cantidadTotal: 0,
                    costoTotalUsd: 0
                };
            }
            materiales[key].cantidadTotal += (m.cantidad * partidaCantidad);
            materiales[key].costoTotalUsd += (m.subtotalUsd * partidaCantidad);
        });

        // Mano de Obra
        p.manoObra.forEach(mo => {
            const key = mo.nombre;
            if (!manoObra[key]) {
                manoObra[key] = {
                    nombre: mo.nombre,
                    unidad: 'Jornal',
                    cantidadTotal: 0,
                    costoTotalUsd: 0
                };
            }
            manoObra[key].cantidadTotal += (mo.cantidad * partidaCantidad);
            manoObra[key].costoTotalUsd += (mo.subtotalUsd * partidaCantidad);
        });

        // Equipos
        p.equipos.forEach(eq => {
            const key = eq.nombre;
            if (!equipos[key]) {
                equipos[key] = {
                    nombre: eq.nombre,
                    unidad: 'Hora/Día',
                    cantidadTotal: 0,
                    costoTotalUsd: 0
                };
            }
            equipos[key].cantidadTotal += (eq.cantidad * partidaCantidad);
            equipos[key].costoTotalUsd += (eq.subtotalUsd * partidaCantidad);
        });
    });

    return {
        materiales: Object.values(materiales).sort((a, b) => b.costoTotalUsd - a.costoTotalUsd),
        manoObra: Object.values(manoObra).sort((a, b) => b.costoTotalUsd - a.costoTotalUsd),
        equipos: Object.values(equipos).sort((a, b) => b.costoTotalUsd - a.costoTotalUsd)
    };
};

export const generarPDFPresupuesto = async (proyecto: Proyecto) => {
    // 1. Initialize Document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Helper for formatting currency (USD)
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;
    const fmtNum = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format;
    const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const config = proyecto.config;

    // --- SECCION 1: RESUMEN DEL PRESUPUESTO ---

    // HEADER
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.text('CALCULADORA APU SOFTWARE', 105, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESUPUESTO DE OBRA', 105, 23, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 26, 196, 26);

    // PROJECT INFO
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

    // Tasa Cambio Info
    doc.setFont('helvetica', 'bold');
    doc.text('TASA:', 110, infoY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${config.tasaCambio} Bs/USD`, 135, infoY + 12);

    // GLOBAL FACTORS
    const factorsY = infoY + 18;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, factorsY, 182, 12, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // Slate 600

    const factorsText = `FACTORES:   IVA: ${config.iva}%    |    Utilidad: ${config.utilidad}%    |    Admin: ${config.administracion}%    |    FCAS: ${config.fcas.factorTotal}%`;
    doc.text(factorsText, 105, factorsY + 7, { align: 'center' });

    // MAIN TABLE (Budget Summary)
    const tableBody = (proyecto.partidas || []).map(p => [
        p.codigo || '-',
        p.titulo || 'Sin Descripción',
        p.unidadMedida || '-',
        p.cantidad || 0,
        fmt(p.precioUnitarioUsd || 0),
        fmt(p.precioTotalUsd || 0)
    ]);

    autoTable(doc, {
        startY: factorsY + 16,
        head: [['CÓDIGO', 'DESCRIPCIÓN', 'UND', 'CANT', 'P. UNITARIO ($)', 'TOTAL ($)']],
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

    // ECONOMIC SUMMARY (Total)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastY = (doc as any).lastAutoTable.finalY + 10;

    // Check if we need a new page for summary
    if (lastY > 180) {
        doc.addPage();
        lastY = 30;
    }

    const totalMateriales = proyecto.partidas.reduce((sum, p) => sum + (p.costoMaterialesUsd * p.cantidad), 0);
    const totalManoObra = proyecto.partidas.reduce((sum, p) => sum + (p.costoManoObraUsd * p.cantidad), 0);
    const totalEquipos = proyecto.partidas.reduce((sum, p) => sum + (p.costoEquiposUsd * p.cantidad), 0);

    const costoDirectoTotal = totalMateriales + totalManoObra + totalEquipos;
    const adminTotal = costoDirectoTotal * (config.administracion / 100);
    const sub1 = costoDirectoTotal + adminTotal;
    const utilidadTotal = sub1 * (config.utilidad / 100);
    const subtotal = sub1 + utilidadTotal;
    const ivaTotal = subtotal * (config.iva / 100);
    const granTotal = subtotal + ivaTotal;

    const summaryX = 60;
    const summaryWidth = 90;
    const sumY = lastY;

    // Draw Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, sumY, summaryWidth, 90, 'F');
    doc.rect(summaryX, sumY, summaryWidth, 90, 'S');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('RESUMEN GENERAL', 105, sumY - 5, { align: 'center' }); // Label above box

    let currentY = sumY + 10;
    const drawRow = (label: string, value: number, bold = false) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(0);
        doc.text(label, summaryX + 5, currentY);
        doc.text(fmt(value), summaryX + summaryWidth - 5, currentY, { align: 'right' });
        currentY += 8;
    };

    drawRow('Materiales:', totalMateriales);
    drawRow('Mano de Obra:', totalManoObra);
    drawRow('Equipos:', totalEquipos);

    currentY += 2;
    doc.setDrawColor(200);
    doc.line(summaryX + 5, currentY - 4, summaryX + summaryWidth - 5, currentY - 4);

    drawRow('COSTO DIRECTO:', costoDirectoTotal, true);
    currentY += 2;

    drawRow(`Administración (${config.administracion}%):`, adminTotal);
    drawRow(`Utilidad (${config.utilidad}%):`, utilidadTotal);

    currentY += 2;
    doc.line(summaryX + 5, currentY - 4, summaryX + summaryWidth - 5, currentY - 4);

    drawRow('SUBTOTAL (Sin IVA):', subtotal, true);
    drawRow(`IVA (${config.iva}%):`, ivaTotal);

    currentY += 6;
    doc.setFillColor(30, 58, 138); // Blue 900
    doc.rect(summaryX, currentY - 8, summaryWidth, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GENERAL (USD)', summaryX + 5, currentY + 1);
    doc.text(fmt(granTotal), summaryX + summaryWidth - 5, currentY + 1, { align: 'right' });

    doc.addPage();

    // --- SECCION 2: ANÁLISIS DETALLADO (APU) ---
    // Here we iterate all items and create a detailed breakdown

    proyecto.partidas.forEach((partida, index) => {
        if (index > 0) doc.addPage(); // New page for each APU

        let y = 20;

        // Title APU
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.text(`APU #${partida.codigo || (index + 1)}`, 14, y);
        y += 8;

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(partida.titulo.toUpperCase(), 14, y, { maxWidth: 180 });
        const dim = doc.getTextDimensions(partida.titulo.toUpperCase(), { maxWidth: 180 });
        y += dim.h + 5;

        // Info Block
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, 182, 14, 'F');
        doc.setFontSize(9);

        doc.text(`UNIDAD: ${partida.unidadMedida}`, 20, y + 9);
        doc.text(`CANTIDAD: ${partida.cantidad}`, 70, y + 9);
        doc.text(`RENDIMIENTO: ${partida.rendimiento}`, 120, y + 9);
        y += 20;

        // -- MATERIALES --
        if (partida.materiales.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 58, 138);
            doc.text('1. MATERIALES', 14, y);
            y += 2;

            autoTable(doc, {
                startY: y,
                head: [['Descripción', 'Unidad', 'Precio ($)', 'Cantidad', 'Desp %', 'Subtotal ($)']],
                body: partida.materiales.map(m => [
                    m.nombre,
                    m.unidad,
                    fmt(m.precioBaseUsd),
                    m.cantidad,
                    m.desperdicio + '%',
                    fmt(m.subtotalUsd)
                ]),
                theme: 'grid',
                headStyles: { fillColor: [203, 213, 225], textColor: 0, fontStyle: 'bold', fontSize: 8 },
                bodyStyles: { fontSize: 8, textColor: 50 },
                columnStyles: {
                    2: { halign: 'right' },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'right', fontStyle: 'bold' }
                },
                margin: { left: 14, right: 14 }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            y = (doc as any).lastAutoTable.finalY + 10;
        }

        // -- MANO DE OBRA --
        if (partida.manoObra.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 58, 138);
            doc.text('2. MANO DE OBRA', 14, y);
            y += 2;

            autoTable(doc, {
                startY: y,
                head: [['Descripción', 'Jornal ($)', 'Cantidad', 'Subtotal ($)']],
                body: partida.manoObra.map(m => [
                    m.nombre,
                    fmt(m.jornalBaseUsd),
                    m.cantidad,
                    fmt(m.subtotalUsd) // This is effectively (Jornal * Cant * FCAS) / Rendimiento ? No, subtotal in type is per unit
                ]),
                theme: 'grid',
                headStyles: { fillColor: [203, 213, 225], textColor: 0, fontStyle: 'bold', fontSize: 8 },
                bodyStyles: { fontSize: 8, textColor: 50 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'center' },
                    3: { halign: 'right', fontStyle: 'bold' }
                },
                margin: { left: 14, right: 14 }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            y = (doc as any).lastAutoTable.finalY + 10;
        }

        // -- EQUIPOS --
        if (partida.equipos.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 58, 138);
            doc.text('3. EQUIPOS Y HERRAMIENTAS', 14, y);
            y += 2;

            autoTable(doc, {
                startY: y,
                head: [['Descripción', 'Costo/Día ($)', 'Cantidad', 'Subtotal ($)']],
                body: partida.equipos.map(e => [
                    e.nombre,
                    fmt(e.costoDiaUsd),
                    e.cantidad,
                    fmt(e.subtotalUsd)
                ]),
                theme: 'grid',
                headStyles: { fillColor: [203, 213, 225], textColor: 0, fontStyle: 'bold', fontSize: 8 },
                bodyStyles: { fontSize: 8, textColor: 50 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'center' },
                    3: { halign: 'right', fontStyle: 'bold' }
                },
                margin: { left: 14, right: 14 }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            y = (doc as any).lastAutoTable.finalY + 10;
        }

        // Unit Price Summary for this Item
        if (y > 220) { doc.addPage(); y = 20; }

        const sumX = 110;
        const sumW = 86;

        doc.setDrawColor(200);
        doc.setFillColor(255);
        doc.rect(sumX, y, sumW, 40, 'S');

        doc.setFontSize(9);
        doc.setTextColor(0);

        let ry = y + 6;
        const dr = (l: string, v: number, b = false) => {
            doc.setFont('helvetica', b ? 'bold' : 'normal');
            doc.text(l, sumX + 2, ry);
            doc.text(fmt(v), sumX + sumW - 2, ry, { align: 'right' });
            ry += 6;
        };

        dr('Costo Directo Unit.:',
            (partida.costoMaterialesUsd + partida.costoManoObraUsd + partida.costoEquiposUsd), true
        );
        dr(`Admin (${config.administracion}%):`,
            (partida.costoMaterialesUsd + partida.costoManoObraUsd + partida.costoEquiposUsd) * (config.administracion / 100)
        );
        dr(`Utilidad (${config.utilidad}%):`,
            ((partida.costoMaterialesUsd + partida.costoManoObraUsd + partida.costoEquiposUsd) * (1 + config.administracion / 100)) * (config.utilidad / 100)
        ); // Approximation for display, real val is in partida.precioUnitario

        // Let's use stored values if possible, but we don't store breakdown of Admin/Util per item usually, 
        // we calculate them on the fly in `calculos.ts`.
        // The `partida.precioUnitarioUsd` is the final price.

        doc.setDrawColor(0);
        doc.line(sumX, ry - 2, sumX + sumW, ry - 2);

        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.text('PRECIO UNITARIO:', sumX + 2, ry + 2);
        doc.text(fmt(partida.precioUnitarioUsd), sumX + sumW - 2, ry + 2, { align: 'right' });

    });

    // Save
    const filename = `Presupuesto_Analisis_${(proyecto.nombre || 'APU').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    try {
        if (Capacitor.isNativePlatform()) {
            const base64Data = doc.output('datauristring').split(',')[1];
            try {
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });
                await Share.share({
                    title: 'Presupuesto de Obra',
                    text: `Presupuesto: ${proyecto.nombre}`,
                    url: savedFile.uri,
                });
            } catch (e) {
                console.error("Filesystem error", e);
                alert("Error al compartir.");
            }
            return;
        }

        doc.save(filename);

    } catch (error) {
        console.error("Download failed:", error);
        alert("Error al descargar PDF.");
    }
};
