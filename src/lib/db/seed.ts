import { addDocument } from '$lib/db';
import { register } from '$lib/services/auth';
import type { Product, Customer } from '$lib/types';

// إنشاء مستخدمين للاختبار
export async function seedUsers() {
    try {
        // إنشاء مستخدم مدير
        await register('admin', 'admin123', 'مدير النظام', 'admin');

        // إنشاء مستخدم موظف
        await register('cashier', 'cashier123', 'موظف المبيعات', 'cashier');

        console.log('تم إنشاء المستخدمين بنجاح');
    } catch (error) {
        if (error instanceof Error) {
            console.error('خطأ في إنشاء المستخدمين:', error.message, error.stack);
        } else {
            console.error('خطأ غير معروف في إنشاء المستخدمين:', error);
        }
    }
}

// إنشاء منتجات للاختبار
export async function seedProducts() {
    const products: Partial<Product>[] = [
        {
            sku: 'P001',
            name: 'لابتوب HP',
            description: 'لابتوب HP الجيل العاشر',
            price: 3499.99,
            cost: 3000,
            stock: 10,
            minStock: 2,
            tax: 0.15,
            category: 'إلكترونيات',
            barcode: '123456789',
            unit: 'piece',
            isActive: true
        },
        {
            sku: 'P002',
            name: 'سماعات بلوتوث',
            description: 'سماعات لاسلكية عالية الجودة',
            price: 199.99,
            cost: 120,
            stock: 20,
            minStock: 5,
            tax: 0.15,
            category: 'إلكترونيات',
            barcode: '987654321',
            unit: 'piece',
            isActive: true
        },
        {
            sku: 'P003',
            name: 'قهوة عربية',
            description: 'قهوة عربية فاخرة',
            price: 45,
            cost: 25,
            stock: 50,
            minStock: 10,
            tax: 0.15,
            category: 'مشروبات',
            barcode: '456789123',
            unit: 'kg',
            isActive: true
        }
    ];

    try {
        await Promise.all(products.map(product => addDocument('products', product)));
        console.log('تم إنشاء المنتجات بنجاح');
    } catch (error) {
        if (error instanceof Error) {
            console.error('خطأ في إنشاء المنتجات:', error.message, error.stack);
        } else {
            console.error('خطأ غير معروف في إنشاء المنتجات:', error);
        }
    }
}

// إنشاء عملاء للاختبار
export async function seedCustomers() {
    const customers: Partial<Customer>[] = [
        {
            name: 'أحمد محمد',
            phone: '0501234567',
            email: 'ahmed@example.com',
            type: 'retail',
            balance: 0,
            loyaltyPoints: 0
        },
        {
            name: 'شركة التقنية',
            phone: '0559876543',
            email: 'info@techcompany.com',
            type: 'wholesale',
            balance: 0,
            loyaltyPoints: 0
        }
    ];

    try {
        await Promise.all(customers.map(customer => addDocument('customers', customer)));
        console.log('تم إنشاء العملاء بنجاح');
    } catch (error) {
        if (error instanceof Error) {
            console.error('خطأ في إنشاء العملاء:', error.message, error.stack);
        } else {
            console.error('خطأ غير معروف في إنشاء العملاء:', error);
        }
    }
}

// تهيئة جميع البيانات
export async function seedAll() {
    await seedUsers();
    await seedProducts();
    await seedCustomers();
    console.log('تم إنشاء جميع بيانات الاختبار بنجاح');
}