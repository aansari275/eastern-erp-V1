import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, QrCode, Calendar, Ruler, Palette, Package } from 'lucide-react';
export const RugDetailsViewer = ({ data, onBack }) => {
    const [rugDetails, setRugDetails] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (data) {
            fetchRugByCarpetNo(data.trim());
        }
    }, [data]);
    const fetchRugByCarpetNo = async (carpetNo) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/rugs');
            if (!response.ok) {
                throw new Error('Failed to fetch rugs');
            }
            const rugs = await response.json();
            const foundRug = rugs.find((rug) => rug.carpetNo === carpetNo ||
                rug.designName === carpetNo);
            if (foundRug) {
                setRugDetails(foundRug);
            }
            else {
                setError(`No rug found with carpet number: ${carpetNo}`);
            }
        }
        catch (err) {
            setError('Failed to fetch rug details');
        }
        finally {
            setLoading(false);
        }
    };
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx(QrCode, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Invalid QR Code" }), _jsx("p", { className: "text-gray-600", children: error }), onBack && (_jsx("button", { onClick: onBack, className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Go Back" }))] }) }) }));
    }
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Loading Rug Details" }), _jsx("p", { className: "text-gray-600", children: "Searching for rug information..." })] }) }) }));
    }
    if (!rugDetails && !loading && !error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx(QrCode, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Scan QR Code" }), _jsx("p", { className: "text-gray-600", children: "Please scan a rug label QR code to view details" })] }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-center mb-6", children: [onBack && (_jsx("button", { onClick: onBack, className: "mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) })), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Rug Details" }), _jsx("p", { className: "text-gray-600", children: "Scanned from QR code" })] })] }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-xl text-blue-900", children: rugDetails.designName || 'N/A' }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(QrCode, { className: "w-3 h-3 mr-1" }), "QR Scanned"] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Package, { className: "w-5 h-5 text-gray-500 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Construction" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: rugDetails.construction || 'N/A' })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Palette, { className: "w-5 h-5 text-gray-500 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Color" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: rugDetails.color || 'N/A' })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Ruler, { className: "w-5 h-5 text-gray-500 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Size" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: rugDetails.size || 'N/A' })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Pile GSM" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: rugDetails.pileGSM || 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Total GSM" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: rugDetails.totalGSM || rugDetails.finishedGSM || 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Carpet No." }), _jsx("p", { className: "text-lg font-mono text-gray-900", children: rugDetails.carpetNo || 'N/A' })] })] })] }), _jsx(Separator, {}), (rugDetails.quality || rugDetails.buyer || rugDetails.ops) && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [rugDetails.quality && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Quality" }), _jsx("p", { className: "text-base text-gray-900", children: rugDetails.quality })] })), rugDetails.buyer && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Buyer" }), _jsx("p", { className: "text-base text-gray-900", children: rugDetails.buyer })] })), rugDetails.ops && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "OPS No." }), _jsx("p", { className: "text-base font-mono text-gray-900", children: rugDetails.ops })] }))] })), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsxs("span", { children: ["Scanned on ", new Date().toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })] })] })] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(QrCode, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-1", children: "QR Code Information" }), _jsx("p", { className: "text-sm text-gray-600", children: "This rug sample has been digitally tagged for easy identification and tracking. For more information, contact Eastern Mills." })] })] }) }) })] }) }));
};
