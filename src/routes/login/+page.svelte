<script lang="ts">
  import { login } from '$lib/services/auth';
  import { goto } from '$app/navigation';
  
  let username = '';
  let password = '';
  let error: string | null = null;
  let loading = false;
  
  async function handleSubmit() {
    error = null;
    loading = true;
    
    try {
      await login(username, password);
      goto('/');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        تسجيل الدخول
      </h2>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      {#if error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {error}
          </div>
        </div>
      {/if}
      
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">اسم المستخدم</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            bind:value={username}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="اسم المستخدم"
            autocomplete="username"
          />
        </div>
        <div>
          <label for="password" class="sr-only">كلمة المرور</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="كلمة المرور"
            autocomplete="current-password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {#if loading}
            جاري التحميل...
          {:else}
            تسجيل الدخول
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>