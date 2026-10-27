"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useId, useRef, useState } from "react";

type StaffQrScannerProps = {
  onScan: (payload: string) => void;
  disabled?: boolean;
  cameraErrorLabel: string;
};

async function stopScannerSafely(scanner: Html5Qrcode, wasRunning: boolean) {
  if (!wasRunning) {
    return;
  }
  try {
    await scanner.stop();
  } catch {
    /* html5-qrcode throws if stop() runs before start() finished */
  }
  try {
    scanner.clear();
  } catch {
    /* clear can fail if the DOM node was already removed */
  }
}

export function StaffQrScanner({ onScan, disabled, cameraErrorLabel }: StaffQrScannerProps) {
  const reactId = useId();
  const containerId = `staff-qr-${reactId.replace(/:/g, "")}`;
  const onScanRef = useRef(onScan);
  const lastPayloadRef = useRef("");
  const lastAtRef = useRef(0);
  const [cameraError, setCameraError] = useState(false);

  onScanRef.current = onScan;

  useEffect(() => {
    if (disabled) {
      return;
    }

    let cancelled = false;
    let running = false;
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    setCameraError(false);

    const startTask = (async () => {
      const cameras = await Html5Qrcode.getCameras();
      if (cancelled) {
        return;
      }
      if (cameras.length === 0) {
        throw new Error("no-camera");
      }
      const cameraId = cameras[cameras.length - 1]!.id;
      await scanner.start(
        cameraId,
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          const now = Date.now();
          if (decoded === lastPayloadRef.current && now - lastAtRef.current < 1200) {
            return;
          }
          lastPayloadRef.current = decoded;
          lastAtRef.current = now;
          onScanRef.current(decoded);
        },
        () => undefined,
      );
      running = true;
    })();

    void startTask.catch(() => {
      if (!cancelled) {
        setCameraError(true);
      }
    });

    return () => {
      cancelled = true;
      void (async () => {
        try {
          await startTask;
        } catch {
          /* start failed or was interrupted */
        }
        await stopScannerSafely(scanner, running);
      })();
    };
  }, [containerId, disabled]);

  return (
    <div className="space-y-2">
      <div
        id={containerId}
        className={`mx-auto max-w-sm overflow-hidden rounded-sm border border-line bg-black [&_video]:!h-auto [&_video]:!w-full ${
          cameraError ? "hidden" : ""
        }`}
      />
      {cameraError ? <p className="text-center text-sm text-muted">{cameraErrorLabel}</p> : null}
    </div>
  );
}
