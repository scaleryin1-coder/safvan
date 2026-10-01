import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Receipt,
  Download,
  Star
} from 'lucide-react';
import { Booking } from '../types';
import { triggerHaptic, playSound } from '../utils/feedback';
import { openWhatsAppAlert, formatJobCompletedInvoiceWhatsApp } from '../utils/whatsapp';

interface DigitalInvoiceModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onOpenReview?: () => void;
}

export const DigitalInvoiceModal: React.FC<DigitalInvoiceModalProps> = ({
  booking,
  isOpen,
  onClose,
  onOpenReview
}) => {
  if (!isOpen) return null;

  const invoiceNumber = booking.invoiceNumber || `INV-JOBIT-${booking.id.replace(/\D/g, '').slice(0, 6) || '98231'}`;
  const totalAmount = booking.finalTotal || booking.estimatedTotal;
  const completedDate = booking.completedAt ? new Date(booking.completedAt) : new Date();

  // Itemized breakdown calculations
  const baseVisitCharge = 99;
  const laborCharge = Math.max(0, totalAmount - baseVisitCharge);
  const safetyFee = 29;
  const discount = 29;

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    const msg = formatJobCompletedInvoiceWhatsApp(booking);
    openWhatsAppAlert(booking.customerPhone, msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-xs text-white">
              JOB
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider">Digital Tax Invoice</h2>
              <p className="text-[10px] text-stone-400 font-mono">{invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Body Printable Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Badge & Stamp */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                Issue Date & Time
              </span>
              <p className="text-xs font-bold text-black mt-0.5">
                {completedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Official Paid Stamp */}
            <div className="border-2 border-emerald-600 text-emerald-700 px-3 py-1 rounded-xl rotate-[-4deg] text-center font-black shadow-xs">
              <span className="text-xs tracking-wider block">PAID & VERIFIED</span>
              <span className="text-[8px] font-mono block">VIA {booking.paymentMethod.toUpperCase()}</span>
            </div>
          </div>

          {/* Parties Info Grid: Customer & Pro */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-[11px]">
            <div>
              <span className="font-black text-stone-400 uppercase text-[9px] block">Customer Details:</span>
              <p className="font-black text-black mt-0.5 text-xs">{booking.customerName}</p>
              <p className="text-stone-500 font-mono">{booking.customerPhone}</p>
              <p className="text-stone-500 line-clamp-2 mt-0.5">{booking.customerAddress}</p>
            </div>
            <div>
              <span className="font-black text-stone-400 uppercase text-[9px] block">Service Partner:</span>
              <p className="font-black text-black mt-0.5 text-xs flex items-center gap-1">
                <span>{booking.workerName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </p>
              <p className="text-stone-500">{booking.workerProfession}</p>
              <p className="text-stone-500 font-mono">{booking.workerPhone}</p>
            </div>
          </div>

          {/* Itemized Table Breakdown */}
          <div className="space-y-2">
            <h3 className="font-black text-stone-800 uppercase text-[10px] tracking-wider">
              Itemized Price Breakdown
            </h3>
            <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
              <div className="p-2.5 flex items-center justify-between bg-stone-50 text-[11px] font-bold text-stone-500">
                <span>Description</span>
                <span>Amount</span>
              </div>
              
              <div className="p-2.5 flex items-center justify-between text-stone-800">
                <div>
                  <p className="font-black">{booking.taskTitle}</p>
                  <p className="text-[10px] text-stone-500">Skilled labour charges ({booking.estimatedHours} hrs)</p>
                </div>
                <span className="font-bold">₹{laborCharge}</span>
              </div>

              <div className="p-2.5 flex items-center justify-between text-stone-800">
                <div>
                  <p className="font-bold">Base Visiting & Diagnostic Charge</p>
                  <p className="text-[10px] text-stone-500">Includes travel & initial inspection</p>
                </div>
                <span className="font-bold">₹{baseVisitCharge}</span>
              </div>

              <div className="p-2.5 flex items-center justify-between text-stone-800">
                <div>
                  <p className="font-bold">JOBit Safety & Protection Cover</p>
                  <p className="text-[10px] text-stone-500">Damage protection & verified background check</p>
                </div>
                <span className="font-bold">₹{safetyFee}</span>
              </div>

              <div className="p-2.5 flex items-center justify-between text-emerald-600 font-bold">
                <div>
                  <p>Promo Launch Subsidy</p>
                  <p className="text-[10px] text-emerald-700/80">Direct fee waiver</p>
                </div>
                <span>-₹{discount}</span>
              </div>

              <div className="p-2.5 flex items-center justify-between text-stone-500 text-[11px]">
                <span>Platform Commission (Direct Payout)</span>
                <span className="text-emerald-700 font-bold">₹0.00 (Zero markup)</span>
              </div>

              {/* Total Row */}
              <div className="p-3 flex items-center justify-between bg-red-50 text-red-950 font-black text-sm">
                <span>Total Amount Paid</span>
                <span className="text-base text-red-600">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Guarantee Footer Note */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2 text-stone-600 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              This is a computer-generated tax invoice verified under the <strong>JOBit Fair Pricing Policy</strong>. 100% money-back rework warranty within 7 days.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send to WhatsApp</span>
            </button>

            {onOpenReview && (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onClose();
                  onOpenReview();
                }}
                className="py-3 px-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Rate & Review Pro</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
