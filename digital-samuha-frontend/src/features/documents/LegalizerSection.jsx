import React from 'react';
import { FileBadge, Printer } from 'lucide-react';

const LegalizerSection = ({ samuhaDetails }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <FileBadge size={32} />
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">Government Registration Template</h2>
          <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
            Generate and print a standard Samuha registration document for submission to your local ward or municipality office.
          </p>
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-white text-indigo-600 rounded-[20px] font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Printer size={22} />
            Print Registration Form
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white border-2 border-gray-100 rounded-[40px] p-6 max-w-4xl mx-auto shadow-sm printable-section">
        <style>
          {`
            @media print {
              @page { margin: 10mm; }
              body * { visibility: hidden; }
              .printable-section, .printable-section * { visibility: visible; }
              .printable-section { 
                position: absolute; 
                left: 0; top: 0; 
                width: 100%; 
                border: none !important; 
                box-shadow: none !important; 
                padding: 10mm !important; 
                margin: 0 !important; 
              }
              button { display: none !important; }
            }
          `}
        </style>
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-gray-900 border-b-4 border-indigo-600 inline-block pb-1 mb-2">
             समूह दर्ताको लागि निवेदन
          </h1>
          <p className="text-sm font-bold text-gray-600 uppercase tracking-widest underline decoration-2 underline-offset-4">
            Application for Samuha Registration
          </p>
        </div>

        <div className="space-y-3 text-gray-900 text-sm leading-normal px-2">
          <div>
            <p className="font-bold text-base">श्रीमान वडा अध्यक्ष ज्यू,</p>
            <p className="font-medium">{samuhaDetails?.ward_number || '..........'} नं. वडा कार्यालय,</p>
            <p className="font-medium">{samuhaDetails?.municipality || '..........'}, {samuhaDetails?.district || '..........'}</p>
          </div>
          
          <div className="text-center py-2">
            <p className="font-black text-lg underline decoration-2 underline-offset-4">विषय: समूह दर्ता सम्बन्धमा ।</p>
          </div>

          <div className="mb-2">
            <p className="font-bold text-base mb-1">महोदय,</p>
            <p className="text-justify font-medium leading-relaxed">
              उपरोक्त विषयमा यस <span className="font-black">{samuhaDetails?.samuha_name || '....................'}</span> का सदस्यहरूको मिति <span className="font-black">{samuhaDetails?.created_at ? new Date(samuhaDetails.created_at).toLocaleDateString() : '..........'}</span> को निर्णय अनुसार यस वडामा सामाजिक कार्य, सरसफाइ तथा समुदायको उत्थानका लागि एक समूह गठन गरी दर्ता गर्ने निर्णय भएको हुनाले यो निवेदन पेश गरेका छौँ ।
            </p>
            <p className="text-justify font-medium leading-relaxed mt-2">
              हाम्रो यस समूहको प्रस्तावित विधान, कार्यसमितिको विवरण र सदस्यहरूको नागरिकताको प्रतिलिपि यसै साथ संलग्न छ । अतः प्रचलित कानुन बमोजिम हाम्रो समूह दर्ता गरिदिनुहुन हार्दिक अनुरोध गर्दछौँ ।
            </p>
          </div>

          <div className="mt-4">
            <p className="font-bold text-base mb-1">संलग्न कागजातहरू:</p>
            <ul className="space-y-1 text-sm font-medium ml-2">
              <li>१. समूहको विधान (२ प्रति)</li>
              <li>२. कार्यसमितिको बैठकको निर्णय (माइन्युट) को प्रतिलिपि</li>
              <li>३. सबै सदस्यहरूको नागरिकताको प्रमाणित प्रतिलिपि</li>
              <li>४. कार्यसमितिका पदाधिकारीहरूको फोटो</li>
              <li>५. कार्यालय रहने घरको भाडा सम्झौता (आवश्यक भएमा)</li>
            </ul>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-56">
               <p className="font-bold text-base mb-6">निवेदक:</p>
               <div className="border-t-[1.5px] border-dashed border-gray-400 pt-1">
                 <p className="font-bold italic text-gray-600 text-xs">(अध्यक्षको हस्ताक्षर)</p>
                 <div className="mt-2 space-y-1">
                   <p className="font-bold">नाम: <span className="font-black">{samuhaDetails?.adhakshya_full_name || '..........'}</span></p>
                   <p className="font-bold">पद: अध्यक्ष</p>
                   <p className="font-bold">सम्पर्क नं: <span className="font-black font-mono tracking-wider">{samuhaDetails?.adhakshya_phone || '..........'}</span></p>
                   <p className="font-bold mt-1">मिति: <span>{new Date().toLocaleDateString()}</span></p>
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
