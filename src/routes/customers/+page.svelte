<script lang="ts">
  import { onMount } from 'svelte';
  import { queryDocuments, addDocument, updateDocument, deleteDocument } from '$lib/db';
  import type { Customer, Invoice } from '$lib/types';
  
  let customers: Customer[] = [];
  let loading = true;
  let error: string | null = null;
  let showForm = false;
  let editingCustomer: Partial<Customer> | null = null;
  let selectedCustomer: Customer | null = null;
  let customerInvoices: Invoice[] = [];
  
  // نموذج العميل الجديد
  let form = {
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'retail',
    notes: '',
    balance: 0,
    loyaltyPoints: 0
  };
  
  // تحميل العملاء
  async function loadCustomers() {
    try {
      const result = await queryDocuments('customers', {
        selector: {},
        sort: [{ name: 'asc' }]
      });
      customers = result.docs as Customer[];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  // تحميل فواتير العميل
  async function loadCustomerInvoices(customerId: string) {
    try {
      const result = await queryDocuments('invoices', {
        selector: { customerId },
        sort: [{ createdAt: 'desc' }]
      });
      customerInvoices = result.docs as Invoice[];
    } catch (err) {
      error = err.message;
    }
  }
  
  // حفظ العميل
  async function saveCustomer() {
    try {
      if (editingCustomer?._id) {
        // تحديث عميل موجود
        await updateDocument('customers', editingCustomer._id, {
          ...form,
          updatedAt: new Date().toISOString()
        });
      } else {
        // إضافة عميل جديد
        await addDocument('customers', {
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // إعادة تحميل القائمة
      await loadCustomers();
      resetForm();
    } catch (err) {
      error = err.message;
    }
  }
  
  // حذف عميل
  async function handleDelete(customer: Customer) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await deleteDocument('customers', customer._id);
        await loadCustomers();
      } catch (err) {
        error = err.message;
      }
    }
  }
  
  // تعديل عميل
  function handleEdit(customer: Customer) {
    editingCustomer = customer;
    form = { ...customer };
    showForm = true;
  }
  
  // عرض تفاصيل العميل
  async function showCustomerDetails(customer: Customer) {
    selectedCustomer = customer;
    await loadCustomerInvoices(customer._id);
  }
  
  // إعادة تعيين النموذج
  function resetForm() {
    form = {
      name: '',
      phone: '',
      email: '',
      address: '',
      type: 'retail',
      notes: '',
      balance: 0,
      loyaltyPoints: 0
    };
    editingCustomer = null;
    showForm = false;
  }
  
  onMount(loadCustomers);
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900">إدارة العملاء</h1>
      <button
        class="btn btn-primary"
        on:click={() => {
          resetForm();
          showForm = true;
        }}
      >
        إضافة عميل جديد
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
          {editingCustomer ? 'تعديل عميل' : 'إضافة عميل جديد'}
        </h2>
        
        <form on:submit|preventDefault={saveCustomer} class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                الاسم
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
                رقم الهاتف
              </label>
              <input
                type="tel"
                required
                bind:value={form.phone}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                bind:value={form.email}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                العنوان
              </label>
              <input
                type="text"
                bind:value={form.address}
                class="mt-1 input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                نوع العميل
              </label>
              <select bind:value={form.type} class="mt-1 input">
                <option value="retail">تجزئة</option>
                <option value="wholesale">جملة</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                الملاحظات
              </label>
              <textarea
                bind:value={form.notes}
                class="mt-1 input"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 space-x-reverse">
            <button type="button" class="btn btn-secondary" on:click={resetForm}>
              إلغاء
            </button>
            <button type="submit" class="btn btn-primary">
              {editingCustomer ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    {/if}
    
    {#if loading}
      <div class="mt-6 text-center">جاري التحميل...</div>
    {:else if selectedCustomer}
      <div class="mt-6 bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-lg font-medium">{selectedCustomer.name}</h2>
            <div class="mt-1 text-sm text-gray-600">
              <p>رقم الهاتف: {selectedCustomer.phone}</p>
              {#if selectedCustomer.email}
                <p>البريد الإلكتروني: {selectedCustomer.email}</p>
              {/if}
              <p>نوع العميل: {selectedCustomer.type === 'retail' ? 'تجزئة' : 'جملة'}</p>
              <p>الرصيد: {selectedCustomer.balance} ريال</p>
              <p>نقاط الولاء: {selectedCustomer.loyaltyPoints}</p>
            </div>
          </div>
          <button
            class="btn btn-secondary"
            on:click={() => selectedCustomer = null}
          >
            عودة للقائمة
          </button>
        </div>
        
        <h3 class="mt-6 text-lg font-medium">سجل المشتريات</h3>
        {#if customerInvoices.length === 0}
          <p class="mt-2 text-gray-600">لا توجد مشتريات سابقة</p>
        {:else}
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رقم الفاتورة
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    التاريخ
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المبلغ
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each customerInvoices as invoice}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {invoice.number}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {new Date(invoice.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {invoice.total} ريال
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }">
                        {
                          invoice.status === 'paid' ? 'مدفوع' :
                          invoice.status === 'partial' ? 'مدفوع جزئياً' :
                          'ملغي'
                        }
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {:else}
      <div class="mt-6 bg-white shadow overflow-hidden rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهاتف
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع العميل
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرصيد
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نقاط الولاء
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each customers as customer}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    class="text-blue-600 hover:text-blue-900"
                    on:click={() => showCustomerDetails(customer)}
                  >
                    {customer.name}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {customer.phone}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {customer.type === 'retail' ? 'تجزئة' : 'جملة'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {customer.balance} ريال
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {customer.loyaltyPoints}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <button
                    class="text-blue-600 hover:text-blue-900 ml-4"
                    on:click={() => handleEdit(customer)}
                  >
                    تعديل
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    on:click={() => handleDelete(customer)}
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