import { readable, writable } from 'svelte/store';

// حالة الماسح الضوئي
export const scannerActive = writable(false);

// حالة طلب الإذن للكاميرا
export const cameraPermission = readable(null, set => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
        navigator.permissions.query({ name: 'camera' as PermissionName })
            .then(permission => {
                set(permission.state);
                permission.onchange = () => set(permission.state);
            })
            .catch(() => set('denied'));
    } else {
        set('denied');
    }
});