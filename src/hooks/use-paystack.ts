
'use client';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackConfig {
    publicKey: string;
    email: string;
    amount: number; // in Kobo
    reference: string;
    metadata?: object;
    onClose: () => void;
    callback: (response: any) => void;
}

const usePaystack = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Paystack script.");
      setScriptLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = (config: PaystackConfig) => {
    if (scriptLoaded && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: config.publicKey,
        email: config.email,
        amount: config.amount,
        ref: config.reference,
        metadata: config.metadata,
        onClose: config.onClose,
        callback: config.callback,
      });
      handler.openIframe();
    } else {
      console.error("Paystack script not loaded or available.");
      // You could have a fallback here, e.g. show an error toast
    }
  };

  return initializePayment;
};

export default usePaystack;
