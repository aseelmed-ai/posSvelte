<script lang="ts">
  import { onMount } from 'svelte';
  import { queryDocuments } from '$lib/db';
  import Chart from 'chart.js/auto';
  import type { Invoice, Product } from '$lib/types';
  
  let salesChart: Chart;
  let inventoryChart: Chart;
  let loading = true;
  let error: string | null = null;
  
  // إحصائيات عامة
  let stats = {
    totalSales: 0,
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    topProducts: [] as { name: string; total: number }[],
    monthlySales: [] as { month: string; total: number }[]
  };
  
  onMount(async () => {
    try {
      await loadStats();
      initCharts();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  async function loadStats() {
    // تحميل المبيعات
    const today = new Date().toISOString().split('T')[0];
    const invoices = await queryDocuments('invoices', {
      selector: {
        status: 'paid'
      }
    });
    
    const allInvoices = invoices.docs as Invoice[];
    
    // إجمالي المبيعات
    stats.totalSales = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // مبيعات اليوم
    stats.todaySales = allInvoices
      .filter(inv => inv.createdAt.startsWith(today))
      .reduce((sum, inv) => sum + inv.total, 0);
    
    // المنتجات الأكثر مبيعاً
    const productSales = {};
    allInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });
    
    // تحميل معلومات المنتجات
    const products = await queryDocuments('products', {
      selector: {
        _id: {
          $in: Object.keys(productSales)
        }
      }
    });
    
    const allProducts = products.docs as Product[];
    stats.totalProducts = allProducts.length;
    stats.lowStock = allProducts.filter(p => p.stock <= p.minStock).length;
    
    // ترتيب المنتجات حسب المبيعات
    stats.topProducts = allProducts
      .map(product => ({
        name: product.name,
        total: productSales[product._id] || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    // المبيعات الشهرية
    const monthlyData = {};
    allInvoices.forEach(invoice => {
      const month = invoice.createdAt.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + invoice.total;
    });
    
    stats.monthlySales = Object.entries(monthlyData)
      .map(([month, total]) => ({ month, total: total as number }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  
  function initCharts() {
    // مخطط المبيعات الشهرية
    const salesCtx = document.getElementById('salesChart') as HTMLCanvasElement;
    salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: stats.monthlySales.map(m => m.month),
        datasets: [{
          label: 'المبيعات الشهرية',
          data: stats.monthlySales.map(m => m.total),
          borderColor: '#2563eb',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
    
    // مخطط المنتجات الأكثر مبيعاً
    const inventoryCtx = document.getElementById('inventoryChart') as HTMLCanvasElement;
    inventoryChart = new Chart(inventoryCtx, {
      type: 'bar',
      data: {
        labels: stats.topProducts.map(p => p.name),
        datasets: [{
          label: 'المنتجات الأكثر مبيعاً',
          data: stats.topProducts.map(p => p.total),
          backgroundColor: '#60a5fa'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">التقارير والإحصائيات</h1>
    
    {#if error}
      <div class="bg-red-50 p-4 rounded-md">
        <div class="text-sm text-red-700">{error}</div>
      </div>
    {:else if loading}
      <div class="text-center">جاري التحميل...</div>
    {:else}
      <!-- بطاقات الإحصائيات -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <!-- أيقونة المبيعات -->
              </div>
              <div class="mr-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    إجمالي المبيعات
                  </dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalSales} ريال
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <!-- أيقونة المبيعات اليومية -->
              </div>
              <div class="mr-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    مبيعات اليوم
                  </dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.todaySales} ريال
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <!-- أيقونة المنتجات -->
              </div>
              <div class="mr-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    إجمالي المنتجات
                  </dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <!-- أيقونة المخزون -->
              </div>
              <div class="mr-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    منتجات منخفضة المخزون
                  </dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.lowStock}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- الرسوم البيانية -->
      <div class="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">المبيعات الشهرية</h3>
          <canvas id="salesChart"></canvas>
        </div>
        
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">المنتجات الأكثر مبيعاً</h3>
          <canvas id="inventoryChart"></canvas>
        </div>
      </div>
    {/if}
  </div>
</div>