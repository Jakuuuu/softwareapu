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
            const key = m.nombre; // Group by name for clearer output
            if (!materiales[key]) {
                materiales[key] = {
                    nombre: m.nombre,
                    unidad: m.unidad,
                    cantidadTotal: 0,
                    costoTotalUsd: 0
                };
            }
            materiales[key].cantidadTotal += (m.cantidad * partidaCantidad);
            // subtotalUsd is unit cost with waste. Total = UnitCost * PartidaQuantity
            materiales[key].costoTotalUsd += (m.subtotalUsd * partidaCantidad);
        });

        // Mano de Obra
        p.manoObra.forEach(mo => {
            const key = mo.nombre;
            if (!manoObra[key]) {
                manoObra[key] = {
                    nombre: mo.nombre,
                    unidad: 'Jornal', // Usually Jornal/Day
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

    // 2. HEADER
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.text('CALCULADORA APU SOFTWARE', 105, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESUPUESTO DE OBRA', 105, 23, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 26, 196, 26);

    // 3. PROJECT INFO
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

    // 4. GLOBAL FACTORS
    const factorsY = infoY + 18;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, factorsY, 182, 12, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // Slate 600

    const factorsText = `FACTORES:   IVA: ${config.iva}%    |    Utilidad: ${config.utilidad}%    |    Admin: ${config.administracion}%    |    FCAS: ${config.fcas.factorTotal}%`;
    doc.text(factorsText, 105, factorsY + 7, { align: 'center' });

    // 5. MAIN TABLE (Budget Summary)
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

    // 6. RESOURCE SUMMARIES
    const resources = aggregateResources(proyecto.partidas || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastY = (doc as any).lastAutoTable.finalY + 10;

    // Helper for page breaks
    const checkPageBreak = (heightNeeded: number = 30) => {
        if (lastY + heightNeeded > 270) {
            doc.addPage();
            lastY = 20;
            return true;
        }
        return false;
    };

    // --- MATERIALES ---
    if (resources.materiales.length > 0) {
        checkPageBreak();

        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138); // Blue 900
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN DE MATERIALES', 14, lastY);

        // Draw underline
        doc.setDrawColor(30, 58, 138);
        doc.line(14, lastY + 2, 70, lastY + 2);

        autoTable(doc, {
            startY: lastY + 5,
            head: [['DESCRIPCIÓN', 'UND', 'CANTIDAD TOTAL', 'COSTO TOTAL ($)']],
            body: resources.materiales.map(m => [
                m.nombre,
                m.unidad,
                fmtNum(m.cantidadTotal),
                fmt(m.costoTotalUsd)
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: [30, 58, 138], // Blue 900
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold'
            },
            columnStyles: {
                2: { halign: 'center' },
                3: { halign: 'right', fontStyle: 'bold' }
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- MANO DE OBRA ---
    if (resources.manoObra.length > 0) {
        checkPageBreak();

        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN DE MANO DE OBRA', 14, lastY);

        doc.setDrawColor(30, 58, 138);
        doc.line(14, lastY + 2, 75, lastY + 2);

        autoTable(doc, {
            startY: lastY + 5,
            head: [['CARGO / DESCRIPCIÓN', 'CANTIDAD (Jornales)', 'COSTO TOTAL ($)']],
            body: resources.manoObra.map(m => [
                m.nombre,
                fmtNum(m.cantidadTotal),
                fmt(m.costoTotalUsd)
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: [30, 58, 138], // Blue 900
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold'
            },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'right', fontStyle: 'bold' }
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- EQUIPOS ---
    if (resources.equipos.length > 0) {
        checkPageBreak();

        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN DE EQUIPOS', 14, lastY);

        doc.setDrawColor(30, 58, 138);
        doc.line(14, lastY + 2, 65, lastY + 2);

        autoTable(doc, {
            startY: lastY + 5,
            head: [['DESCRIPCIÓN', 'CANTIDAD (Horas)', 'COSTO TOTAL ($)']],
            body: resources.equipos.map(m => [
                m.nombre,
                fmtNum(m.cantidadTotal),
                fmt(m.costoTotalUsd)
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: [30, 58, 138], // Blue 900
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold'
            },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'right', fontStyle: 'bold' }
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastY = (doc as any).lastAutoTable.finalY + 15;
    }


    // 7. ECONOMIC SUMMARY (Total)
    // Always add a new page for the summary if it doesn't fit mostly
    if (lastY > 180) {
        doc.addPage();
        lastY = 30;
    } else {
        lastY += 10;
    }

    // Calculate totals (Using USD fields)
    const totalMateriales = proyecto.partidas.reduce((sum, p) => sum + (p.costoMaterialesUsd * p.cantidad), 0);
    const totalManoObra = proyecto.partidas.reduce((sum, p) => sum + (p.costoManoObraUsd * p.cantidad), 0);
    const totalEquipos = proyecto.partidas.reduce((sum, p) => sum + (p.costoEquiposUsd * p.cantidad), 0);

    const costoDirectoTotal = totalMateriales + totalManoObra + totalEquipos;

    // Recalculate global factors based on total direct cost
    const adminTotal = costoDirectoTotal * (config.administracion / 100);
    const sub1 = costoDirectoTotal + adminTotal;
    const utilidadTotal = sub1 * (config.utilidad / 100);

    const subtotal = sub1 + utilidadTotal;
    const ivaTotal = subtotal * (config.iva / 100);
    const granTotal = subtotal + ivaTotal;

    const summaryX = 60; // Centered box
    const summaryWidth = 90;
    let sumY = lastY;

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

    // 8. FOOTER
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, 196, 285, { align: 'right' });
        doc.text(`Generado el: ${now} - Tasa Ref: ${config.tasaCambio} Bs/$`, 14, 285);
    }

    // 9. SAVE
    const filename = `Presupuesto_${(proyecto.nombre || 'APU_Project').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

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
                    text: `Presupuesto del proyecto: ${proyecto.nombre}`,
                    url: savedFile.uri,
                    dialogTitle: 'Compartir Presupuesto',
                });
            } catch (e) {
                console.error("Filesystem/Share error:", e);
                alert("Error al compartir en móvil.");
            }
            return;
        }

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error("Download failed:", error);
        doc.save(filename);
        alert("Si la descarga no inicia, revisa los permisos.");
    }
};
