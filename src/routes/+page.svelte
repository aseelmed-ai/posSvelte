<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores';
  import type { Product } from '$lib/types';
  import db, { queryDocuments } from '$lib/db';
  
  let searchTerm = '';
  let products: Product[] = [];
  let loading = true;
  let error: string | null = null;
  
  // البحث عن المنتجات
  async function searchProducts() {
    try {
      const result = await queryDocuments('products', {
        selector: {
          $or: [
            { name: { $regex: RegExp(searchTerm, 'i') } },
            { sku: { $regex: RegExp(searchTerm, 'i') } },
            { barcode: searchTerm }
          ],
          isActive: true
        },
        limit: 10
      });
      products = result.docs;
    } catch (err) {
      error = err.message;
    }
  }
  
  // إضافة منتج إلى السلة
  function addToCart(product: Product) {
    cart.update(state => {
      const existingItem = state.items.find(item => item.productId === product._id);
      if (existingItem) {
        existingItem.quantity += 1;
        return {
          ...state,
          items: [...state.items]
        };
      } else {
        return {
          ...state,
          items: [...state.items, {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            tax: product.tax
          }]
        };
      }
    });
  }
  
  // حساب المجموع
  $: {
    if ($cart.items.length) {
      const subtotal = $cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = $cart.items.reduce((sum, item) => sum + (item.price * item.quantity * item.tax), 0);
      cart.update(state => ({
        ...state,
        subtotal,
        tax,
        total: subtotal + tax - state.discount
      }));
    }
  }
  
  // تحميل البيانات عند بدء التطبيق
  onMount(async () => {
    try {
      const result = await queryDocuments('products', {
        selector: { isActive: true },
        limit: 10
      });
      products = result.docs;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <!-- جزء البحث والمنتجات -->
  <div class="col-span-2 bg-white rounded-lg shadow">
    <div class="p-4">
      <input
        type="text"
        placeholder="ابحث عن منتج (الاسم، الرمز، الباركود)"
        bind:value={searchTerm}
        on:input={searchProducts}
        class="input"
      />
      
      {#if loading}
        <div class="text-center py-4">جاري التحميل...</div>
      {:else if error}
        <div class="text-red-600 py-4">{error}</div>
      {:else if products.length === 0}
        <div class="text-center py-4">لا توجد منتجات</div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {#each products as product}
            <button
              on:click={() => addToCart(product)}
              class="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div class="font-medium">{product.name}</div>
              <div class="text-gray-600">{product.price} ريال</div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- جزء السلة -->
  <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-lg font-medium mb-4">السلة</h2>
    
    {#if $cart.items.length === 0}
      <div class="text-center text-gray-500">السلة فارغة</div>
    {:else}
      <div class="space-y-4">
        {#each $cart.items as item}
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium">{item.name}</div>
              <div class="text-gray-600">
                {item.quantity} × {item.price} ريال
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                class="px-2 py-1 text-sm border rounded"
                on:click={() => {
                  cart.update(state => ({
                    ...state,
                    items: state.items.map(i => 
                      i.productId === item.productId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                    )
                  }));
                }}
              >
                +
              </button>
              <button
                class="px-2 py-1 text-sm border rounded"
                on:click={() => {
                  cart.update(state => ({
                    ...state,
                    items: item.quantity === 1
                      ? state.items.filter(i => i.productId !== item.productId)
                      : state.items.map(i =>
                          i.productId === item.productId
                            ? { ...i, quantity: i.quantity - 1 }
                            : i
                        )
                  }));
                }}
              >
                -
              </button>
            </div>
          </div>
        {/each}
        
        <hr class="my-4" />
        
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span>{$cart.subtotal} ريال</span>
          </div>
          <div class="flex justify-between">
            <span>الضريبة:</span>
            <span>{$cart.tax} ريال</span>
          </div>
          {#if $cart.discount > 0}
            <div class="flex justify-between text-green-600">
              <span>الخصم:</span>
              <span>- {$cart.discount} ريال</span>
            </div>
          {/if}
          <div class="flex justify-between font-bold">
            <span>الإجمالي:</span>
            <span>{$cart.total} ريال</span>
          </div>
        </div>
        
        <button
          class="w-full btn btn-primary mt-4"
          on:click={() => {
            // معالجة الدفع
          }}
        >
          إتمام الطلب
        </button>
      </div>
    {/if}
  </div>
</div>