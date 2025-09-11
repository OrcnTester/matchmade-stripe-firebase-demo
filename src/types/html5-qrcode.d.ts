declare module "html5-qrcode" {
  export type Qrbox =
    | number
    | { width: number; height: number };

  export interface Html5QrcodeScannerConfig {
    fps?: number;
    qrbox?: Qrbox;
    aspectRatio?: number;
    disableFlip?: boolean;
  }

  export class Html5QrcodeScanner {
    constructor(elementId: string, config?: Html5QrcodeScannerConfig, verbose?: boolean);
    render(
      onScanSuccess: (decodedText: string, decodedResult: unknown) => void,
      onScanFailure?: (error: unknown) => void
    ): void;
    clear(): Promise<void>;
  }
}
