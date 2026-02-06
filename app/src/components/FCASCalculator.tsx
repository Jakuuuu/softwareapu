import { useState } from 'react';
import { calculateFCAS, type ProjectConfig } from '../services/api';

export const FCASCalculator = () => {
    const [result, setResult] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<ProjectConfig>({
        vacation_days_base: 15,
        holidays_count: 12,
        bonus_days_base: 45,
        avg_sickness_days: 3,
        ivss_pct: 11,
        faov_pct: 2,
        inces_pct: 2,
        pension_apply_to_fcas: true,
        pension_law_pct: 9
    });

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const res = await calculateFCAS(config);
            setResult(res.fcas_factor);
        } catch (err) {
            console.error(err);
            alert("Error connecting to backend");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Calculadora FCAS (Venezuela)</h2>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-gray-700">Días Feriados</span>
                    <input
                        type="number"
                        value={config.holidays_count}
                        onChange={e => setConfig({ ...config, holidays_count: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </label>
                <label className="block">
                    <span className="text-gray-700">Ley Pensiones (%)</span>
                    <input
                        type="number"
                        value={config.pension_law_pct}
                        onChange={e => setConfig({ ...config, pension_law_pct: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </label>
            </div>

            <button
                onClick={handleCalculate}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                disabled={loading}
            >
                {loading ? 'Calculando...' : 'Calcular FCAS'}
            </button>

            {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600">Factor Resultante:</p>
                    <p className="text-3xl font-bold text-green-800">{result}</p>
                    <p className="text-sm text-green-600">Sobrecosto: {((result - 1) * 100).toFixed(2)}%</p>
                </div>
            )}
        </div>
    );
};
