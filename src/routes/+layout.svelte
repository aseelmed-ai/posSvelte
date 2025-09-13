<script lang="ts">
  import { page } from '$app/stores';
  import { currentUser, isOnline } from '$lib/stores';
  import { notifications } from '$lib/components/Notifications.svelte';
  import NavLink from '$lib/components/NavLink.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
</script>

<div class="min-h-screen bg-gray-100">
  {#if $currentUser}
    <!-- Header -->
    <header class="bg-white shadow">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold">نظام نقاط البيع</h1>
            </div>
            <div class="hidden sm:mr-6 sm:flex sm:space-x-4">
              <NavLink href="/" exact>الرئيسية</NavLink>
              <NavLink href="/products">المنتجات</NavLink>
              <NavLink href="/customers">العملاء</NavLink>
              <NavLink href="/reports">التقارير</NavLink>
              {#if $currentUser.role === 'admin'}
                <NavLink href="/settings">الإعدادات</NavLink>
              {/if}
            </div>
          </div>
          <div class="flex items-center space-x-4">
            {#if !$isOnline}
              <span class="px-2 py-1 text-sm text-red-600 bg-red-100 rounded-md">
                غير متصل
              </span>
            {/if}
            <div class="relative group">
              <button class="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                <span>{$currentUser.name}</span>
                <span class="text-xs text-gray-500">({$currentUser.role === 'admin' ? 'مدير' : 'موظف'})</span>
              </button>
              <div class="absolute left-0 w-48 py-1 mt-2 bg-white rounded-md shadow-lg hidden group-hover:block">
                <a
                  href="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  الملف الشخصي
                </a>
                <button
                  class="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  on:click={() => {
                    // تسجيل الخروج
                    currentUser.set(null);
                    notifications.add('تم تسجيل الخروج بنجاح', 'success');
                  }}
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- المحتوى الرئيسي -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  {:else}
    <!-- صفحة تسجيل الدخول -->
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
        </div>
        <slot />
      </div>
    </div>
  {/if}
</div>