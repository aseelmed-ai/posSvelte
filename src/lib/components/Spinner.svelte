<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let center = false;
</script>

<div class:text-center={center}>
  <div
    class="inline-block animate-spin rounded-full border-4 border-solid border-current border-l-transparent"
    class:w-4={size === 'sm'}
    class:h-4={size === 'sm'}
    class:w-8={size === 'md'}
    class:h-8={size === 'md'}
    class:w-12={size === 'lg'}
    class:h-12={size === 'lg'}
    role="status"
  >
    <span class="sr-only">جاري التحميل...</span>
  </div>
</div>