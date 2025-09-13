<script lang="ts">
  import { onMount } from 'svelte';
  import { queryDocuments, addDocument, updateDocument, deleteDocument } from '$lib/db';
  import type { Product } from '$lib/types';
  
  let products: Product[] = [];
  let loading = true;
  let error: string | null = null;
  let showForm = false;
  let editingProduct: Partial<Product> | null = null;
  
  // نموذج المنتج الجديد
  let form = {
    sku: '',
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    tax: 0,
    category: '',
    barcode: '',
    unit: 'piece',
    isActive: true
  };
  
  // تحميل المنتجات
  async function loadProducts() {
    try {
      const result = await queryDocuments('products', {
        selector: {},
        sort: [{ name: 'asc' }]
      });
      products = result.docs as Product[];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  // حفظ المنتج
  async function saveProduct() {
    try {
      if (editingProduct?._id) {
        // تحديث منتج موجود
        await updateDocument('products', editingProduct._id, {
          ...form,
          updatedAt: new Date().toISOString()
        });
      } else {
        // إضافة منتج جديد
        await addDocument('products', {
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // إعادة تحميل القائمة
      await loadProducts();
      resetForm();
    } catch (err) {
      error = err.message;
    }
  }
  
  // حذف منتج
  async function handleDelete(product: Product) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteDocument('products', product._id);
        await loadProducts();
      } catch (err) {
        error = err.message;
      }
    }
  }
  
  // تعديل منتج
  function handleEdit(product: Product) {
    editingProduct = product;
    form = { ...product };
    showForm = true;
  }
  
  // إعادة تعيين النموذج
  function resetForm() {
    form = {
      sku: '',
      name: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      tax: 0,
      category: '',
      barcode: '',
      unit: 'piece',
      isActive: true
    };
    editingProduct = null;
    showForm = false;
  }
  
  onMount(loadProducts);
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900">إدارة المنتجات</h1>
      <button
        class="btn btn-primary"
        on:click={() => {
          resetForm();
          showForm = true;
        }}
      >
        إضافة منتج جديد
      </button>
    </div>
    
    {#if error}
      <div class="mt-4 bg-red-50 p-4 rounded-md">
        <div class="text-sm text-red-700">{error}</div>
      </div>
    {/if}
    
    {#if showForm}
      <div class="mt-6 bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium mb-4">
          {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
        </h2>
        
        <form on:submit|preventDefault={saveProduct} class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                رمز المنتج (SKU)
              </label>
              <input
                type="text"
                required
                bind:value={form.sku}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                اسم المنتج
              </label>
              <input
                type="text"
                required
                bind:value={form.name}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                السعر
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                bind:value={form.price}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                التكلفة
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                bind:value={form.cost}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                المخزون
              </label>
              <input
                type="number"
                required
                min="0"
                bind:value={form.stock}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                الحد الأدنى للمخزون
              </label>
              <input
                type="number"
                required
                min="0"
                bind:value={form.minStock}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                الضريبة (%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.01"
                bind:value={form.tax}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                التصنيف
              </label>
              <input
                type="text"
                bind:value={form.category}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                الباركود
              </label>
              <input
                type="text"
                bind:value={form.barcode}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                الوحدة
              </label>
              <select bind:value={form.unit} class="mt-1 input">
                <option value="piece">قطعة</option>
                <option value="kg">كيلوجرام</option>
                <option value="meter">متر</option>
                <option value="liter">لتر</option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              bind:checked={form.isActive}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="mr-2 block text-sm text-gray-900">
              نشط
            </label>
          </div>
          
          <div class="flex justify-end space-x-3 space-x-reverse">
            <button type="button" class="btn btn-secondary" on:click={resetForm}>
              إلغاء
            </button>
            <button type="submit" class="btn btn-primary">
              {editingProduct ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    {/if}
    
    {#if loading}
      <div class="mt-6 text-center">جاري التحميل...</div>
    {:else}
      <div class="mt-6 bg-white shadow overflow-hidden rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                السعر
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزون
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each products as product}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{product.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{product.sku}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{product.price} ريال</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {product.stock}
                    {#if product.stock <= product.minStock}
                      <span class="text-red-600 text-xs">(منخفض)</span>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {product.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <button
                    class="text-blue-600 hover:text-blue-900 ml-4"
                    on:click={() => handleEdit(product)}
                  >
                    تعديل
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    on:click={() => handleDelete(product)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>