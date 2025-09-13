import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
  // السماح بالوصول إلى صفحة تسجيل الدخول دون مصادقة
  if (url.pathname === '/login') {
    return {};
  }

  // التحقق من تسجيل الدخول لباقي الصفحات
  // يمكن إضافة منطق إضافي للتحقق من الجلسة هنا
  // حالياً نعتمد على حالة تسجيل الدخول المخزنة في المتصفح
  
  throw redirect(303, '/login');
};