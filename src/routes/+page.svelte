<!-- Home Feed -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { auth } from '$lib/stores/auth';
  import { CATEGORIES, MUNICIPIOS } from '$lib/types';
  import type { Listing } from '$lib/types';
  import ListingCard from '$lib/components/ListingCard.svelte';

  let listings: Listing[] = [];
  let loading = true;
  let error = '';
  
  // Filters
  let searchQuery = '';
  let selectedCategory = '';
  let selectedMunicipio = '';
  let sortBy = 'created_at';

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
      
      if (selectedMunicipio) {
        query = query.eq('municipio', selectedMunicipio);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      if (sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
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

  // Reactive statement to reload when filters change
  $: if (searchQuery !== undefined || selectedCategory !== undefined || selectedMunicipio !== undefined || sortBy !== undefined) {
    loadListings();
  }

  function clearFilters() {
    searchQuery = '';
    selectedCategory = '';
    selectedMunicipio = '';
    sortBy = 'created_at';
  }
</script>

<svelte:head>
  <title>MercaTech - Electrónicos en Puerto Rico</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
  <!-- Welcome Section -->
  {#if !$auth.user}
    <div class="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white mb-8">
      <div class="max-w-2xl">
        <h1 class="text-3xl font-bold mb-4">Bienvenido a MercaTech</h1>
        <p class="text-lg mb-6 opacity-90">
          El marketplace líder de electrónicos en Puerto Rico. Compra y vende dispositivos de forma segura.
        </p>
        <a href="/auth" class="btn variant-filled bg-white text-primary-600 hover:bg-surface-50">
          Comenzar Ahora
        </a>
      </div>
    </div>
  {/if}

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
          class="input w-full pl-10"
        />
      </div>

      <!-- Filters Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select bind:value={selectedCategory} class="select">
          <option value="">Todas las categorías</option>
          {#each CATEGORIES as category}
            <option value={category}>{category}</option>
          {/each}
        </select>

        <select bind:value={selectedMunicipio} class="select">
          <option value="">Todos los municipios</option>
          {#each MUNICIPIOS as municipio}
            <option value={municipio}>{municipio}</option>
          {/each}
        </select>

        <select bind:value={sortBy} class="select">
          <option value="created_at">Más recientes</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>

        <button
          on:click={clearFilters}
          class="btn variant-outline-surface"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>

  <!-- Results Header -->
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold text-surface-900">
      {#if searchQuery || selectedCategory || selectedMunicipio}
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
      <button on:click={loadListings} class="btn variant-filled-primary">
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
        {#if searchQuery || selectedCategory || selectedMunicipio}
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
