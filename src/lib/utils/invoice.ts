interface InvoiceOrder {
  order_code?: string;
  ordered_at?: string;
  status?: string;
  total?: number;
  shipping_fee?: number;
  discount?: number;
  notes?: string;
  customer?: { name?: string; phone?: string; email?: string; address?: string } | null;
  items?: { product_name: string; quantity: number; unit_price: number; subtotal: number }[];
  warehouse?: { name?: string } | null;
}

export function printInvoice(order: InvoiceOrder, companyName: string) {
  const items = order.items || [];
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${order.order_code || ''}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #10B981; padding-bottom: 16px; }
    .company { font-size: 24px; font-weight: 700; color: #10B981; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #333; text-align: right; }
    .invoice-code { font-size: 14px; color: #666; text-align: right; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-box h4 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
    .info-box p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f8faf9; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    td.right, th.right { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .totals .row.total { border-top: 2px solid #333; font-weight: 700; font-size: 16px; padding-top: 12px; margin-top: 8px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">${companyName}</div>
    </div>
    <div>
      <div class="invoice-title">HÓA ĐƠN</div>
      <div class="invoice-code">#${order.order_code || '---'}</div>
      <div class="invoice-code">${order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('vi-VN') : ''}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h4>Khách hàng</h4>
      <p><strong>${order.customer?.name || '---'}</strong></p>
      ${order.customer?.phone ? `<p>${order.customer.phone}</p>` : ''}
      ${order.customer?.email ? `<p>${order.customer.email}</p>` : ''}
      ${order.customer?.address ? `<p>${order.customer.address}</p>` : ''}
    </div>
    <div class="info-box">
      <h4>Thông tin đơn</h4>
      <p>Trạng thái: <strong>${order.status || ''}</strong></p>
      ${order.warehouse?.name ? `<p>Kho: ${order.warehouse.name}</p>` : ''}
      ${order.notes ? `<p>Ghi chú: ${order.notes}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Sản phẩm</th>
        <th class="right">SL</th>
        <th class="right">Đơn giá</th>
        <th class="right">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.product_name}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">${item.unit_price.toLocaleString('vi-VN')} đ</td>
        <td class="right">${item.subtotal.toLocaleString('vi-VN')} đ</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Tạm tính</span><span>${subtotal.toLocaleString('vi-VN')} đ</span></div>
    <div class="row"><span>Phí vận chuyển</span><span>${(order.shipping_fee || 0).toLocaleString('vi-VN')} đ</span></div>
    <div class="row"><span>Giảm giá</span><span>-${(order.discount || 0).toLocaleString('vi-VN')} đ</span></div>
    <div class="row total"><span>Tổng cộng</span><span>${(order.total || 0).toLocaleString('vi-VN')} đ</span></div>
  </div>

  <div class="footer">
    Cảm ơn quý khách! — ${companyName}
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
