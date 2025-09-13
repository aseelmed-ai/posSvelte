<script lang="ts">
  import { writable } from 'svelte/store';

  type NotificationType = 'success' | 'error' | 'warning' | 'info';

  interface Notification {
    id: string;
    type: NotificationType;
    message: string;
  }

  function createNotificationStore() {
    const { subscribe, update } = writable<Notification[]>([]);

    return {
      subscribe,
      add: (message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        update(notifications => [
          ...notifications,
          { id, type, message }
        ]);

        // إزالة الإشعار بعد 3 ثواني
        setTimeout(() => {
          update(notifications => notifications.filter(n => n.id !== id));
        }, 3000);
      },
      remove: (id: string) => {
        update(notifications => notifications.filter(n => n.id !== id));
      }
    };
  }

  export const notifications = createNotificationStore();
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $notifications as notification}
    <div
      class="notification p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-0"
      class:bg-green-100={notification.type === 'success'}
      class:bg-red-100={notification.type === 'error'}
      class:bg-yellow-100={notification.type === 'warning'}
      class:bg-blue-100={notification.type === 'info'}
      role="alert"
    >
      <div class="flex justify-between items-center">
        <div
          class:text-green-800={notification.type === 'success'}
          class:text-red-800={notification.type === 'error'}
          class:text-yellow-800={notification.type === 'warning'}
          class:text-blue-800={notification.type === 'info'}
        >
          {notification.message}
        </div>
        <button
          class="mr-2 text-gray-400 hover:text-gray-600"
          on:click={() => notifications.remove(notification.id)}
        >
          ×
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .notification {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>