import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Partida } from '../types';
import { CalculadoraAPU } from '../utils/calculos';

// Helper for currency formatting
const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;
// const fmtBs = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format; // Unused for now

interface EditableCellProps {
    value: string | number;
    onChange: (val: string) => void;
    onCommit: () => void;
    type?: 'text' | 'number';
    className?: string;
    align?: 'left' | 'right' | 'center';
}

const EditableCell = ({ value, onChange, onCommit, type = 'text', className = '', align = 'left' }: EditableCellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value?.toString() || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempValue(value?.toString() || '');
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onCommit();
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setTempValue(value?.toString() || '');
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        onCommit();
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={type}
                value={tempValue}
                onChange={(e) => {
                    setTempValue(e.target.value);
                    onChange(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className={`w-full h-full p-1 bg-blue-50 outline-none border-2 border-blue-400 text-sm ${className}`}
                style={{ textAlign: align }}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`w-full h-full p-1 cursor-text hover:bg-gray-50 truncate text-sm flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'} ${className}`}
        >
            {value}
        </div>
    );
};

export const APUDataGrid = () => {
    const { proyectoActual, actualizarPartida } = useProyectoStore();

    if (!proyectoActual) return null;

    const handleUpdate = (id: string, field: keyof Partida, value: string | number) => {
        const partida = proyectoActual.partidas.find(p => p.id === id);
        if (!partida) return;

        let numValue = value;
        if (field === 'cantidad' || field === 'rendimiento') {
            numValue = parseFloat(value.toString()) || 0;
        }

        const changes = { [field]: numValue };

        // Use the centralized calculator to update dependent fields (Unit Price, Total Price)
        const updatedPartida = CalculadoraAPU.actualizarPartida({ ...partida, ...changes }, proyectoActual.config);

        actualizarPartida(id, updatedPartida);
    };

    return (
        <div className="overflow-auto max-h-full border border-gray-200 rounded-lg bg-white shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Código</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Unidad</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Cantidad</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Rendimiento</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">P. Unit ($)</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Total ($)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {proyectoActual.partidas.map((partida) => (
                        <tr key={partida.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="h-10 border-r border-gray-100 p-0">
                                <EditableCell
                                    value={partida.codigo}
                                    onChange={(v) => handleUpdate(partida.id, 'codigo', v)}
                                    onCommit={() => { }}
                                />
                            </td>
                            <td className="h-10 border-r border-gray-100 p-0">
                                <EditableCell
                                    value={partida.titulo}
                                    onChange={(v) => handleUpdate(partida.id, 'titulo', v)}
                                    onCommit={() => { }}
                                />
                            </td>
                            <td className="h-10 border-r border-gray-100 p-0">
                                <EditableCell
                                    value={partida.unidadMedida}
                                    align="center"
                                    onChange={(v) => handleUpdate(partida.id, 'unidadMedida', v)}
                                    onCommit={() => { }}
                                />
                            </td>
                            <td className="h-10 border-r border-gray-100 p-0">
                                <EditableCell
                                    value={partida.cantidad}
                                    align="right"
                                    type="number"
                                    onChange={(v) => handleUpdate(partida.id, 'cantidad', v)}
                                    onCommit={() => { }}
                                    className="font-mono text-slate-700"
                                />
                            </td>
                            <td className="h-10 border-r border-gray-100 p-0">
                                <EditableCell
                                    value={partida.rendimiento}
                                    align="right"
                                    type="number"
                                    onChange={(v) => handleUpdate(partida.id, 'rendimiento', v)}
                                    onCommit={() => { }}
                                    className="font-mono text-slate-700"
                                />
                            </td>
                            <td className="h-10 border-r border-gray-100 px-3 py-2 text-right font-mono text-sm text-slate-600">
                                {fmtUsd(partida.precioUnitarioUsd)}
                            </td>
                            <td className="h-10 px-3 py-2 text-right font-mono text-sm font-bold text-slate-800">
                                {fmtUsd(partida.precioTotalUsd)}
                            </td>
                        </tr>
                    ))}
                    {proyectoActual.partidas.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                No hay partidas en este proyecto. Crea una nueva para comenzar.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
