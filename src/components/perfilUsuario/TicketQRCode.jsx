import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function TicketQRCode({ value, size = 48, className = '' }) {
  const [image, setImage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setImage('');
    setError(false);

    if (!value) return undefined;

    QRCode.toDataURL(String(value), {
      width: size * 4,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        if (active) setImage(dataUrl);
      })
      .catch((qrError) => {
        console.error('No se pudo generar el QR del boleto:', qrError);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (!image) {
    return (
      <div
        role={error ? 'alert' : undefined}
        className={`flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1 text-center text-[9px] text-slate-500 dark:border-slate-700 ${className}`}
        style={{ width: size, height: size }}
      >
        {error ? 'Error QR' : value ? 'Generando QR…' : 'Sin QR'}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt="Código QR del boleto"
      className={`shrink-0 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
