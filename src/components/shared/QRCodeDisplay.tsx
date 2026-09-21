'use client';

import { Modal, Space, Typography, Button } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useLocale } from '@/hooks/useLocale';
import { useRef } from 'react';

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  value: string;
  label?: string;
  sublabel?: string;
}

export function QRCodeDisplay({ open, onClose, value, label, sublabel }: Props) {
  const { t } = useLocale();
  const qrRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = qrRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}</style>
      </head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${value}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t('barcode.qr_code')}
      footer={
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>{t('orders.print_invoice')}</Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>{t('barcode.download')}</Button>
        </Space>
      }
      width={340}
    >
      <div ref={qrRef} style={{ textAlign: 'center', padding: 16 }}>
        <QRCodeSVG value={value} size={200} level="M" />
        {label && <Title level={5} style={{ marginTop: 12, marginBottom: 0 }}>{label}</Title>}
        {sublabel && <Text type="secondary">{sublabel}</Text>}
        <Text style={{ display: 'block', marginTop: 8, fontFamily: 'monospace', fontSize: 13 }}>{value}</Text>
      </div>
    </Modal>
  );
}
