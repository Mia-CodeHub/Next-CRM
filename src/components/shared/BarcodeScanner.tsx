'use client';

import { Modal, App, Typography, Space, Button, Alert } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useLocale } from '@/hooks/useLocale';
import { useEffect, useRef, useState } from 'react';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: Props) {
  const { t } = useLocale();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrcodeRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setError(null);
    setScanning(false);

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted || !scannerRef.current) return;

        const scannerId = 'barcode-scanner-element';
        scannerRef.current.id = scannerId;

        const scanner = new Html5Qrcode(scannerId);
        html5QrcodeRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop().catch(() => {});
            onClose();
          },
          () => {}
        );
        if (mounted) setScanning(true);
      } catch (err) {
        if (mounted) {
          setError(t('barcode.camera_error'));
        }
      }
    };

    const timer = setTimeout(startScanner, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
      const scanner = html5QrcodeRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (scanner?.stop) {
        scanner.stop().catch(() => {});
      }
      if (scanner?.clear) {
        scanner.clear();
      }
      html5QrcodeRef.current = null;
    };
  }, [open, onScan, onClose, t]);

  const handleClose = () => {
    const scanner = html5QrcodeRef.current as { stop?: () => Promise<void> } | null;
    if (scanner?.stop) {
      scanner.stop().catch(() => {});
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <Space>
          <CameraOutlined />
          <span>{t('barcode.scan_title')}</span>
        </Space>
      }
      footer={null}
      width={400}
      destroyOnHidden
    >
      {error ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      ) : !scanning ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Text type="secondary">{t('barcode.initializing')}</Text>
        </div>
      ) : null}
      <div
        ref={scannerRef}
        style={{ width: '100%', minHeight: 280, borderRadius: 8, overflow: 'hidden' }}
      />
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 12 }}>
        {t('barcode.scan_hint')}
      </Text>
    </Modal>
  );
}
