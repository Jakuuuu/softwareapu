import { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out
        }, 2000); // Display for 2 seconds

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="text-center space-y-4 p-8 animate-in fade-in zoom-in duration-700">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 mb-4">
                    <span className="material-symbols-outlined text-6xl text-white">calculate</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Calculadora
                    <span className="block text-blue-400 mt-2">Control Integral</span>
                </h1>
                <div className="w-16 h-1 bg-blue-500 rounded-full mx-auto mt-6 animate-pulse"></div>
            </div>
        </div>
    );
};
