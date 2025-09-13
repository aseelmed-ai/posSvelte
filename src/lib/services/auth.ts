import bcrypt from 'bcryptjs';
import { addDocument, queryDocuments, getDocument } from '$lib/db';
import type { User } from '$lib/types';
import { currentUser } from '$lib/stores';

const SALT_ROUNDS = 10;

export async function register(username: string, password: string, name: string, role: 'admin' | 'cashier' = 'cashier') {
    // التحقق من عدم وجود مستخدم بنفس اسم المستخدم
    const exists = await queryDocuments('users', {
        selector: { username },
        limit: 1
    });

    if (exists.docs.length > 0) {
        throw new Error('اسم المستخدم موجود مسبقاً');
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // إنشاء المستخدم
    const user = await addDocument('users', {
        username,
        passwordHash,
        name,
        role,
        permissions: role === 'admin' ? ['*'] : ['pos.access', 'products.view', 'customers.view'],
        isActive: true,
        createdAt: new Date().toISOString()
    });

    return user;
}

export async function login(username: string, password: string) {
    // البحث عن المستخدم
    const result = await queryDocuments('users', {
        selector: { username },
        limit: 1
    });

    if (result.docs.length === 0) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const user = result.docs[0] as User;

    // التحقق من تنشيط الحساب
    if (!user.isActive) {
        throw new Error('الحساب غير مفعل');
    }

    // التحقق من كلمة المرور
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    // تحديث آخر تسجيل دخول
    user.lastLogin = new Date().toISOString();
    await addDocument('users', user);

    // حذف معلومات الأمان قبل إرجاع البيانات
    const { passwordHash: _, ...safeUser } = user;
    
    // تحديث حالة المستخدم الحالي
    currentUser.set(safeUser);

    return safeUser;
}

export function logout() {
    currentUser.set(null);
}

export function hasPermission(user: User, permission: string): boolean {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
}