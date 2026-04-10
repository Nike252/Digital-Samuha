import React from 'react';
import { FileBadge, Printer } from 'lucide-react';
import { toBS } from '../../utils/nepaliDateUtils';

const LegalizerSection = ({ samuhaDetails }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto">
      <style>
        {`
          @keyframes mesh-pulse {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(10%, -10%) scale(1.2); }
            66% { transform: translate(-5%, 15%) scale(0.8); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .mesh-gradient {
            background-color: #4f46e5;
            background-image: 
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), 
              radial-gradient(at 0% 100%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 50% 100%, hsla(339,49%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 100%, hsla(253,16%,7%,1) 0, transparent 50%);
          }
          .mesh-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            animation: mesh-pulse 20s infinite alternate;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .premium-shadow {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          @media print {
            @page { margin: 5mm; }
            body * { visibility: hidden; }
            .printable-section, .printable-section * { visibility: visible; }
            .printable-section { 
              position: absolute; 
              left: 0; top: 0; 
              width: 100%; 
              border: none !important; 
              box-shadow: none !important; 
              padding: 5mm !important; 
              margin: 0 !important; 
              background: white !important;
            }
            .glass-panel { 
              background: white !important; 
              border: 1.5px solid #e5e7eb !important; 
              backdrop-filter: none !important;
              break-inside: avoid;
              margin-top: 1rem !important;
              padding: 1rem !important;
            }
            .premium-shadow { box-shadow: none !important; }
            .space-y-6 > * + * { margin-top: 0.75rem !important; }
            .leading-loose { line-height: 1.3 !important; }
            .py-6, .py-4 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
            .mt-8, .mt-10, .mt-12 { margin-top: 0.75rem !important; }
            h1 { font-size: 1.5rem !important; }
            button { display: none !important; }
          }
        `}
      </style>

      {/* Premium Header Card */}
      <div className="mesh-gradient rounded-[32px] md:rounded-[48px] p-6 md:p-12 text-white relative overflow-hidden premium-shadow group mx-2 md:mx-0">
        <div className="mesh-blob w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500 -top-24 -left-24 md:-top-48 md:-left-48" />
        <div className="mesh-blob w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-purple-600 -bottom-16 -right-16 md:-bottom-32 md:-right-32 [animation-delay:-5s]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10 text-center md:text-left">
          <div className="w-16 h-16 md:w-24 md:h-24 glass-panel rounded-2xl md:rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl relative">
            <div className="absolute inset-0 bg-white/10 rounded-2xl md:rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <FileBadge size={32} className="md:hidden text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <FileBadge size={44} className="hidden md:block text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>

          <div className="flex-1 space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Government Registration <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200 group-hover:from-white group-hover:to-white transition-all duration-700">Template</span>
            </h2>
            <p className="text-base md:text-xl text-indigo-100/80 font-medium max-w-xl leading-relaxed">
              Generate and print a standard Samuha registration document professionaly formatted for your local ward office.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 w-full md:w-auto">
            <button 
              onClick={() => window.print()}
              className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-indigo-900 rounded-[20px] md:rounded-[24px] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <Printer size={24} />
              Print Now
            </button>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">Official Template v2.4</span>
          </div>
        </div>
      </div>

      {/* Paper-Realistic Preview Section */}
      <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 max-w-4xl mx-auto shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-gray-100 relative printable-section overflow-hidden mx-2 md:mx-auto">
        <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        <div className="text-center mb-8 md:mb-10 mt-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 border-b-8 border-indigo-600/10 inline-block pb-1 md:pb-2 mb-3 uppercase tracking-tight">
             समूह दर्ताको लागि निवेदन
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
            Application for Samuha Registration
          </p>
        </div>

        <div className="space-y-6 text-gray-800 text-xs md:text-sm leading-relaxed px-2 md:px-6">
          <div className="space-y-1">
            <p className="font-extrabold text-base md:text-lg text-gray-900">श्रीमान वडा अध्यक्ष ज्यू,</p>
            <p className="font-semibold text-gray-600">{samuhaDetails?.ward_number || '..........'} नं. वडा कार्यालय,</p>
            <p className="font-semibold text-gray-600">{samuhaDetails?.municipality || '..........'}, {samuhaDetails?.district || '..........'}</p>
          </div>
          
          <div className="text-center py-4 md:py-6">
            <div className="inline-block px-4 md:px-8 py-3 bg-gray-50 rounded-2xl border-2 border-gray-100/50">
               <p className="font-black text-lg md:text-xl text-gray-900 underline decoration-indigo-500 underline-offset-8">विषय: समूह दर्ता सम्बन्धमा ।</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-extrabold text-base md:text-lg text-gray-900">महोदय,</p>
            <p className="text-justify font-medium text-gray-700 leading-loose">
              उपरोक्त विषयमा यस <span className="font-black text-indigo-700 underline underline-offset-4">{samuhaDetails?.samuha_name || '....................'}</span> का सदस्यहरूको मिति <span className="font-bold">{samuhaDetails?.created_at ? toBS(samuhaDetails.created_at) : '..........'}</span> को निर्णय अनुसार यस वडामा सामाजिक कार्य, सरसफाइ तथा समुदायको उत्थानका लागि एक समूह गठन गरी दर्ता गर्ने निर्णय भएको हुनाले यो निवेदन पेश गरेका छौँ ।
            </p>
            <p className="text-justify font-medium text-gray-700 leading-loose">
              हाम्रो यस समूहको प्रस्तावित विधान, कार्यसमितिको विवरण र सदस्यहरूको नागरिकताको प्रतिलिपि यसै साथ संलग्न छ । अतः प्रचलित कानुन बमोजिम हाम्रो समूह दर्ता गरिदिनुहुन हार्दिक अनुरोध गर्दछौँ ।
            </p>
          </div>

          <div className="bg-amber-50/30 p-6 md:p-8 rounded-3xl border border-amber-100/50 mt-8">
            <p className="font-black text-sm md:text-base mb-4 text-amber-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-400 rounded-full" />
              संलग्न कागजातहरू:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm font-bold text-amber-800/80">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] shadow-sm">१</span>
                समूहको विधान (२ प्रति)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] shadow-sm">२</span>
                कार्यसमितिको बैठकको निर्णय
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] shadow-sm">३</span>
                नागरिकताको प्रमाणित प्रतिलिपि
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] shadow-sm">४</span>
                पदाधिकारीहरूको फोटो
              </li>
            </ul>
          </div>

          <div className="mt-8 flex justify-center md:justify-end">
            <div className="w-full md:w-72 p-6 glass-panel rounded-3xl border-gray-200 shadow-sm break-inside-avoid">
               <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 md:mb-8 text-center">निवेदकको आधिकारिक विवरण</p>
               <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200">
                 <p className="font-bold text-gray-700">नाम: <span className="font-black text-gray-900">{samuhaDetails?.adhakshya_full_name || '..........'}</span></p>
                 <p className="font-bold text-gray-700">पद: <span className="text-indigo-600 font-black">अध्यक्ष</span></p>
                 <p className="font-bold text-gray-700">सम्पर्क: <span className="font-black font-mono tracking-wider">{samuhaDetails?.adhakshya_phone || '..........'}</span></p>
                 <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl mt-4">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">हस्ताक्षर (Signature)</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalizerSection;
