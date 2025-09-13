import { dev } from '$app/environment';
import type { LayoutLoad } from './$types';
import { registerSW } from 'workbox-window';

export const load: LayoutLoad = async () => {
  if ('serviceWorker' in navigator && !dev) {
    const wb = new registerSW({
      scriptURL: '/sw.js'
    });
    
    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        if (confirm('تم تحديث التطبيق. هل تريد إعادة التحميل لتطبيق التحديثات؟')) {
          window.location.reload();
        }
      }
    });
  }
  
  return {};
};