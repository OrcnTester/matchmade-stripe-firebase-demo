"use client";

import { useEffect, useState } from "react";
// Tipleri yoksa dert etmeyelim, QR default export
import * as QR from "qrcode";

export default function TicketClient({ id }: { id: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const payload = { ticketId: id, v: 1 };
    (async () => {
      try {
        const url = await QR.toDataURL(JSON.stringify(payload), {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 256,
        });
        setDataUrl(url);
      } catch (e) {
        console.error("[qr] generate fail:", e);
      }
    })();
  }, [id]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your Ticket</h1>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Ticket QR"
          className="mx-auto border rounded p-3 bg-white"
          width={256}
          height={256}
        />
      ) : (
        <div className="text-sm text-gray-600">Generating QR…</div>
      )}
      <div className="text-xs text-gray-500 break-all">
        Ticket ID: <b>{id}</b>
      </div>
    </div>
  );
}
