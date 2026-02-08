import React, { useState } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import { format } from 'date-fns';

const TabValuaciones: React.FC = () => {
    const proyecto = useProyectoStore(state => state.proyectoActual);
    const agregarValuacion = useProyectoStore(state => state.agregarValuacion);
    const eliminarValuacion = useProyectoStore(state => state.eliminarValuacion);

    const [selectedPartidaId, setSelectedPartidaId] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(0);
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);

    if (!proyecto) return <div>No hay proyecto cargado</div>;

    const handleAgregar = () => {
        if (!selectedPartidaId || cantidad <= 0) return;

        agregarValuacion({
            id: crypto.randomUUID(),
            partidaId: selectedPartidaId,
            fecha: new Date(fecha).toISOString(),
            cantidad: Number(cantidad)
        });
        setCantidad(0);
    };

    // Calculate progress per partida
    const reporteProgreso = proyecto.partidas.map(p => {
        const vals = proyecto.valuaciones?.filter(v => v.partidaId === p.id) || [];
        const totalEjecutado = vals.reduce((acc, v) => acc + v.cantidad, 0);
        const porcentaje = p.cantidad > 0 ? (totalEjecutado / p.cantidad) * 100 : 0;
        return {
            partida: p,
            totalEjecutado,
            porcentaje,
            valuaciones: vals
        };
    });

    const totalObra = reporteProgreso.reduce((acc, curr) => acc + (curr.partida.precioTotalUsd || 0), 0);
    const totalEjecutadoUsd = reporteProgreso.reduce((acc, curr) => {
        const pu = curr.partida.precioUnitarioUsd || 0;
        return acc + (curr.totalEjecutado * pu);
    }, 0);
    const avanceGeneral = totalObra > 0 ? (totalEjecutadoUsd / totalObra) * 100 : 0;

    return (
        <div className="space-y-6 p-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-2">Resumen de Avance</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600">Avance Financiero</p>
                        <p className="text-2xl font-bold text-blue-700">{avanceGeneral.toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Ejecutado (USD)</p>
                        <p className="text-2xl font-bold text-green-700">${totalEjecutadoUsd.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">Nueva Valuación</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className='md:col-span-2'>
                        <label className="block text-sm font-medium mb-1">Partida</label>
                        <select
                            className="w-full border rounded p-2"
                            value={selectedPartidaId}
                            onChange={e => setSelectedPartidaId(e.target.value)}
                        >
                            <option value="">Seleccionar Partida...</option>
                            {proyecto.partidas.map(p => (
                                <option key={p.id} value={p.id}>{p.codigo} - {p.titulo}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full border rounded p-2"
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cantidad Ejecutada</label>
                        <input
                            type="number"
                            className="w-full border rounded p-2"
                            value={cantidad}
                            onChange={e => setCantidad(Number(e.target.value))}
                        />
                    </div>
                </div>
                <button
                    onClick={handleAgregar}
                    className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Registrar Valuación
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                <h3 className="font-bold mb-4">Historial por Partida</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2">Partida</th>
                            <th className="p-2 text-right">Cantidad Total</th>
                            <th className="p-2 text-right">Ejecutado</th>
                            <th className="p-2 text-right">% Avance</th>
                            <th className="p-2 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporteProgreso.map((row) => (
                            <React.Fragment key={row.partida.id}>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-2 font-medium">
                                        {row.partida.codigo} - {row.partida.titulo}
                                    </td>
                                    <td className="p-2 text-right">{row.partida.cantidad}</td>
                                    <td className="p-2 text-right font-bold">{row.totalEjecutado}</td>
                                    <td className="p-2 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span>{row.porcentaje.toFixed(1)}%</span>
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${Math.min(row.porcentaje, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className='p-2 text-center'>
                                        {/* Expandable details could go here */}
                                    </td>
                                </tr>
                                {row.valuaciones.length > 0 && (
                                    <tr className="bg-gray-50 text-xs text-gray-500">
                                        <td colSpan={5} className="p-2 pl-8">
                                            <ul className="list-disc pl-4">
                                                {row.valuaciones.map(v => (
                                                    <li key={v.id} className="flex justify-between w-64">
                                                        <span>{format(new Date(v.fecha), 'dd/MM/yyyy')}</span>
                                                        <span>{v.cantidad} {row.partida.unidadMedida}</span>
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => eliminarValuacion(v.id)}
                                                        >
                                                            x
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TabValuaciones;
