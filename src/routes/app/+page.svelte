<!-- Home Feed -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { auth } from '$lib/stores/auth';
  import { CATEGORIES, MUNICIPIOS, CONDITIONS } from '$lib/types';
  import type { Listing } from '$lib/types';
  import ListingCard from '$lib/components/ListingCard.svelte';

  let listings: Listing[] = $state([]);
  let loading = $state(true);
  let error = $state('');
  
  // Enhanced filters
  let searchQuery = $state('');
  let selectedCategory = $state('');
  let selectedCondition = $state('');
  let selectedMunicipio = $state('');
  let minPrice = $state<number | null>(null);
  let maxPrice = $state<number | null>(null);
  let sortBy = $state('newest'); // newest, oldest, price-low, price-high

  // Get unique values for filters from current listings
  let categories = $derived([...new Set(listings.map(l => l.category))].sort());
  let conditions = $derived([...new Set(listings.map(l => l.condition))].sort());
  let municipios = $derived([...new Set(listings.map(l => l.municipio))].sort());

  onMount(() => {
    loadListings();
  });

  async function loadListings() {
    try {
      loading = true;
      error = '';

      let query = supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(display_name, municipio, contact_preference, contact_info)
        `)
        .eq('is_active', true);

      // Apply filters
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedCondition) {
        query = query.eq('condition', selectedCondition);
      }

      if (selectedMunicipio) {
        query = query.eq('municipio', selectedMunicipio);
      }

      if (minPrice !== null) {
        query = query.gte('price', minPrice);
      }

      if (maxPrice !== null) {
        query = query.lte('price', maxPrice);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price-high') {
        query = query.order('price', { ascending: false });
      }

      const { data, error: fetchError } = await query.limit(50);

      if (fetchError) {
        throw fetchError;
      }

      listings = data || [];
    } catch (err: any) {
      error = err.message || 'Error loading listings';
      console.error('Error loading listings:', err);
    } finally {
      loading = false;
    }
  }

  // Effect to reload when filters change
  $effect(() => {
    // Watch filter variables and reload listings when they change
    searchQuery;
    selectedCategory;
    selectedCondition;
    selectedMunicipio;
    minPrice;
    maxPrice;
    sortBy;
    
    // Skip initial load (onMount handles that)
    if (searchQuery !== '' || selectedCategory !== '' || selectedCondition !== '' || 
        selectedMunicipio !== '' || minPrice !== null || maxPrice !== null || sortBy !== 'newest') {
      loadListings();
    }
  });

  function clearFilters() {
    searchQuery = '';
    selectedCategory = '';
    selectedCondition = '';
    selectedMunicipio = '';
    minPrice = null;
    maxPrice = null;
    sortBy = 'newest';
  }
</script>

<svelte:head>
  <title>Explorar - MercaTech</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
  <!-- Search and Filters -->
  <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-6">
    <div class="space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          bind:value={searchQuery}
          class="w-full px-3 py-2 pl-10 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <!-- Filters Section -->
      <div class="border-t border-surface-200 pt-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-surface-900">Filtros</h3>
          <button 
            onclick={clearFilters}
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Categoría</label>
            <select 
              bind:value={selectedCategory}
              class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {#each CATEGORIES as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>

          <!-- Condition Filter -->
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Condición</label>
            <select 
              bind:value={selectedCondition}
              class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las condiciones</option>
              {#each CONDITIONS as condition}
                <option value={condition}>{condition}</option>
              {/each}
            </select>
          </div>

          <!-- Municipality Filter -->
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Municipio</label>
            <select 
              bind:value={selectedMunicipio}
              class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los municipios</option>
              {#each MUNICIPIOS as municipio}
                <option value={municipio}>{municipio}</option>
              {/each}
            </select>
          </div>

          <!-- Price Range -->
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Precio mínimo</label>
            <input 
              type="number" 
              bind:value={minPrice}
              placeholder="$0"
              class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">Precio máximo</label>
            <input 
              type="number" 
              bind:value={maxPrice}
              placeholder="Sin límite"
              class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Sort Options -->
        <div class="mt-4 pt-4 border-t border-surface-200">
          <label class="block text-sm font-medium text-surface-700 mb-2">Ordenar por</label>
          <div class="flex flex-wrap gap-2">
            <button 
              onclick={() => sortBy = 'newest'}
              class="px-3 py-1 text-sm rounded-full border transition-colors {sortBy === 'newest' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-surface-300 text-surface-700 hover:bg-surface-50'}"
            >
              Más recientes
            </button>
            <button 
              onclick={() => sortBy = 'oldest'}
              class="px-3 py-1 text-sm rounded-full border transition-colors {sortBy === 'oldest' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-surface-300 text-surface-700 hover:bg-surface-50'}"
            >
              Más antiguos
            </button>
            <button 
              onclick={() => sortBy = 'price-low'}
              class="px-3 py-1 text-sm rounded-full border transition-colors {sortBy === 'price-low' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-surface-300 text-surface-700 hover:bg-surface-50'}"
            >
              Precio: menor a mayor
            </button>
            <button 
              onclick={() => sortBy = 'price-high'}
              class="px-3 py-1 text-sm rounded-full border transition-colors {sortBy === 'price-high' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-surface-300 text-surface-700 hover:bg-surface-50'}"
            >
              Precio: mayor a menor
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Header -->
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold text-surface-900">
      {#if searchQuery || selectedCategory || selectedCondition || selectedMunicipio || minPrice !== null || maxPrice !== null}
        Resultados de búsqueda
      {:else}
        Productos destacados
      {/if}
      {#if !loading}
        <span class="text-surface-500 font-normal">({listings.length})</span>
      {/if}
    </h2>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each Array(8) as _}
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-4 animate-pulse">
          <div class="bg-surface-200 h-48 rounded-lg mb-4"></div>
          <div class="space-y-2">
            <div class="bg-surface-200 h-4 rounded w-3/4"></div>
            <div class="bg-surface-200 h-4 rounded w-1/2"></div>
            <div class="bg-surface-200 h-6 rounded w-1/3"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if error}
    <!-- Error State -->
    <div class="text-center py-12">
      <div class="mx-auto h-16 w-16 rounded-full bg-error-100 flex items-center justify-center mb-4">
        <svg class="h-8 w-8 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Error al cargar productos</h3>
      <p class="text-surface-600 mb-4">{error}</p>
      <button onclick={loadListings} class="btn variant-filled-primary">
        Intentar de nuevo
      </button>
    </div>
  {:else if listings.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <div class="mx-auto h-16 w-16 rounded-full bg-surface-100 flex items-center justify-center mb-4">
        <svg class="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">No se encontraron productos</h3>
      <p class="text-surface-600 mb-4">
        {#if searchQuery || selectedCategory || selectedCondition || selectedMunicipio || minPrice !== null || maxPrice !== null}
          Intenta ajustar tus filtros de búsqueda.
        {:else}
          Sé el primero en publicar un producto.
        {/if}
      </p>
      {#if $auth.user && $auth.profile}
        <a href="/post" class="btn variant-filled-primary">
          Publicar Producto
        </a>
      {:else}
        <a href="/auth" class="btn variant-filled-primary">
          Iniciar Sesión
        </a>
      {/if}
    </div>
  {:else}
    <!-- Listings Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each listings as listing (listing.id)}
        <ListingCard {listing} />
      {/each}
    </div>
  {/if}
</div>
