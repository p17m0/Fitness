export {};

declare global {
  interface Window {
    cp?: {
      Checkout: new (publicId: string, form: HTMLFormElement) => {
        createCryptogramPacket: () =>
          | string
          | {
              success: boolean;
              message?: string;
              packet?: string;
            };
      };
    };
    CloudPayments?: {
      Checkout?: new (publicId: string, form: HTMLFormElement) => {
        createCryptogramPacket: () =>
          | string
          | {
              success: boolean;
              message?: string;
              packet?: string;
            };
      };
    };
  }
}
