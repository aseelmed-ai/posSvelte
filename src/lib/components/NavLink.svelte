<script lang="ts">
  import { page } from '$app/stores';
  import { currentUser } from '$lib/stores';
  
  export let href: string;
  export let exact = false;
  
  $: active = exact
    ? $page.url.pathname === href
    : $page.url.pathname.startsWith(href);
</script>

<a
  {href}
  class="flex items-center px-4 py-2 text-sm font-medium rounded-md"
  class:bg-blue-100={active}
  class:text-blue-700={active}
  class:text-gray-600={!active}
  class:hover:bg-gray-50={!active}
  class:hover:text-gray-900={!active}
  aria-current={active ? 'page' : undefined}
>
  <slot />
</a>