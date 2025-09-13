// المساعد في تنسيق وطباعة الفواتير
export class ReceiptPrinter {
  // تنسيق رقم الفاتورة
  static formatInvoiceNumber(number: number): string {
    return `INV-${String(number).padStart(6, '0')}`;
  }
  
  // تنسيق التاريخ
  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  // تنسيق المبلغ
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  // إنشاء محتوى الفاتورة بتنسيق HTML
  static generateReceiptHTML(invoice: any, business: any): string {
    return `
      <div class="receipt" dir="rtl" style="font-family: 'Arial', sans-serif; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">${business.name}</h2>
          <p style="margin: 5px 0;">${business.address}</p>
          <p style="margin: 5px 0;">هاتف: ${business.phone}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>رقم الفاتورة: ${this.formatInvoiceNumber(invoice.number)}</p>
          <p>التاريخ: ${this.formatDate(new Date(invoice.createdAt))}</p>
          ${invoice.customerId ? `<p>العميل: ${invoice.customerName}</p>` : ''}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: right;">الصنف</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: left;">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr style="border-bottom: 1px dotted #ccc;">
                <td style="text-align: right;">${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: left;">${this.formatAmount(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-bottom: 20px;">
          <p style="display: flex; justify-content: space-between;">
            <span>المجموع الفرعي:</span>
            <span>${this.formatAmount(invoice.subtotal)}</span>
          </p>
          <p style="display: flex; justify-content: space-between;">
            <span>الضريبة:</span>
            <span>${this.formatAmount(invoice.tax)}</span>
          </p>
          ${invoice.discount ? `
            <p style="display: flex; justify-content: space-between;">
              <span>الخصم:</span>
              <span>-${this.formatAmount(invoice.discount)}</span>
            </p>
          ` : ''}
          <p style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #000; padding-top: 10px;">
            <span>الإجمالي:</span>
            <span>${this.formatAmount(invoice.total)}</span>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p>شكراً لتعاملكم معنا</p>
          ${invoice.barcode ? `
            <img src="data:image/png;base64,${invoice.barcode}" style="max-width: 200px;" />
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // طباعة الفاتورة
  static async printReceipt(invoice: any, business: any): Promise<void> {
    const receiptHTML = this.generateReceiptHTML(invoice, business);
    
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('لم نتمكن من فتح نافذة الطباعة');
    }
    
    // تعيين محتوى نافذة الطباعة
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>فاتورة ${this.formatInvoiceNumber(invoice.number)}</title>
          <meta charset="utf-8">
          <style>
            @media print {
              body {
                width: 80mm;
                margin: 0;
                padding: 0;
              }
              .receipt {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
  }
}