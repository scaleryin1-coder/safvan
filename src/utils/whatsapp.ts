import { Booking } from '../types';

export function getWhatsAppShareUrl(phone: string, text: string): string {
  const cleanNumber = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanNumber.length === 10 ? '91' + cleanNumber : cleanNumber}?text=${encodedText}`;
}

export function openWhatsAppAlert(phone: string, text: string): void {
  const url = getWhatsAppShareUrl(phone, text);
  window.open(url, '_blank');
}

export function formatBookingCreatedWhatsApp(booking: Booking): string {
  return `✅ *JOBit Booking Confirmed!*
--------------------------------
Hello *${booking.customerName}*, your service request has been confirmed!

🔧 *Service:* ${booking.taskTitle}
👷 *Assigned Pro:* ${booking.workerName} (${booking.workerProfession})
📅 *Date:* ${booking.selectedDate}
⏰ *Time Slot:* ${booking.selectedSlotLabel}
📍 *Address:* ${booking.customerAddress}
💰 *Est. Total:* ₹${booking.estimatedTotal} (Pay after service)
🔐 *Secret Start PIN (OTP):* *${booking.otp}*

*Instructions:*
1. Share the 4-digit PIN with ${booking.workerName} only after they arrive at your location.
2. Track your worker live on JOBit.

Thank you for choosing JOBit!`;
}

export function formatWorkerAcceptedWhatsApp(booking: Booking): string {
  return `🤝 *JOBit Pro Assigned & Accepted!*
--------------------------------
Hello *${booking.customerName}*,

Good news! *${booking.workerName}* has accepted your booking #${booking.id}.

🔧 *Task:* ${booking.taskTitle}
📅 *Scheduled for:* ${booking.selectedDate} (${booking.selectedSlotLabel})
📞 *Pro Contact:* ${booking.workerPhone}
📍 *Your Address:* ${booking.customerAddress}

${booking.workerName} will arrive at the scheduled time.`;
}

export function formatWorkerEnRouteWhatsApp(booking: Booking, etaMinutes: number = 8): string {
  return `🛵 *JOBit Pro is En Route!*
--------------------------------
Hello *${booking.customerName}*,

*${booking.workerName}* has started heading towards your location.
⏱️ *Estimated Arrival:* ~${etaMinutes} mins
📍 *Destination:* ${booking.customerAddress}
🔐 *Your Start OTP:* *${booking.otp}*

Please keep your OTP ready to share upon arrival.`;
}

export function formatJobCompletedInvoiceWhatsApp(booking: Booking): string {
  const invoiceNum = booking.invoiceNumber || `INV-JOBIT-${booking.id}`;
  const total = booking.finalTotal || booking.estimatedTotal;
  return `🎉 *JOBit Service Completed & Official Bill*
--------------------------------
Hello *${booking.customerName}*,

Your service *${booking.taskTitle}* has been successfully completed!

🧾 *Invoice #:* ${invoiceNum}
👷 *Pro Partner:* ${booking.workerName}
📅 *Completed on:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
💳 *Payment Mode:* ${booking.paymentMethod.toUpperCase()} (PAID)
💰 *Total Amount:* ₹${total}

⭐ Please take a moment to rate ${booking.workerName}'s service to help top pros get recognized on JOBit!

Thank you for trusting JOBit!`;
}
