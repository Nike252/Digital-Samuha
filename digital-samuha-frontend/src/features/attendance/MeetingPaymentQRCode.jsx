import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, CreditCard } from 'lucide-react';

const MeetingPaymentQRCode = ({ isOpen, onClose, samuhaId, savingAmount, meetingTitle }) => {
  if (!isOpen) return null;

  // URL that members will scan to initiate the eSewa flow
  const paymentUrl = `${window.location.origin}/pay-meeting/${samuhaId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-indigo-600 p-6 text-center text-white">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Smartphone size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold">Collect Savings</h3>
          <p className="text-indigo-200 mt-1">{meetingTitle}</p>
        </div>

        <div className="p-8 pb-10 flex flex-col items-center">
          <p className="text-gray-600 text-center mb-8">
            Tell members to scan this QR code with their mobile camera to securely pay their monthly savings via eSewa.
          </p>

          <div className="p-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm mb-6 relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
            <QRCodeSVG 
              value={paymentUrl}
              size={220}
              level="H"
              includeMargin={true}
              fgColor="#1e1b4b"
            />
          </div>

          <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl flex items-center gap-3 font-bold w-full justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
            <CreditCard size={20} />
            Amount: NPR {savingAmount || '500'}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MeetingPaymentQRCode;
