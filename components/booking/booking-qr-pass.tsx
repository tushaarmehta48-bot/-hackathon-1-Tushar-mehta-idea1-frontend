"use client";

import QRCode from "react-qr-code";

type BookingQrPassProps = {
  reference: string;
  qrValue: string | null;
  hint: string;
  referenceLabel: string;
};

export function BookingQrPass({ reference, qrValue, hint, referenceLabel }: BookingQrPassProps) {
  return (
    <div className="rounded-sm border border-line bg-cream-dark/30 p-6 text-center shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-olive">{referenceLabel}</p>
      <p className="mt-2 font-heading text-2xl text-forest">{reference}</p>
      {qrValue ? (
        <div className="mx-auto mt-6 inline-block rounded-md bg-white p-4">
          <QRCode value={qrValue} size={160} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">{hint}</p>
      )}
    </div>
  );
}
