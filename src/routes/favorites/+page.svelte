<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import type { Listing } from '$lib/types';

  let favorites = $state<(Listing & { favorited_at: string })[]>([]);
  let loading = $state(true);
  let error = $state('');

  // Filter states
  let selectedCategory = $state('');
  let selectedCondition = $state('');
  let selectedMunicipio = $state('');
  let minPrice = $state<number | null>(null);
  let maxPrice = $state<number | null>(null);
  let sortBy = $state('newest'); // newest, oldest, price-low, price-high

  // Get unique values for filters
  let categories = $derived([...new Set(favorites.map(f => f.category))].sort());
  let conditions = $derived([...new Set(favorites.map(f => f.condition))].sort());
  let municipios = $derived([...new Set(favorites.map(f => f.municipio))].sort());

  // Filtered and sorted favorites
  let filteredFavorites = $derived.by(() => {
    let filtered = favorites.filter(listing => {
      if (selectedCategory && listing.category !== selectedCategory) return false;
      if (selectedCondition && listing.condition !== selectedCondition) return false;
      if (selectedMunicipio && listing.municipio !== selectedMunicipio) return false;
      if (minPrice !== null && listing.price < minPrice) return false;
      if (maxPrice !== null && listing.price > maxPrice) return false;
      return true;
    });

    // Sort the filtered results
    switch (sortBy) {
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.favorited_at).getTime() - new Date(b.favorited_at).getTime());
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime());
    }
  });

  function clearFilters() {
    selectedCategory = '';
    selectedCondition = '';
    selectedMunicipio = '';
    minPrice = null;
    maxPrice = null;
    sortBy = 'newest';
  }

  onMount(() => {
    const unsubscribe = auth.subscribe(({ user }) => {
      if (user) {
        loadFavorites();
      } else {
        goto('/auth');
      }
    });

    return unsubscribe;
  });

  async function loadFavorites() {
    try {
      loading = true;
      error = '';

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get favorite listing IDs
      const { data: favoriteData, error: favError } = await supabase
        .from('favorites')
        .select('listing_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favError) throw favError;

      if (!favoriteData || favoriteData.length === 0) {
        favorites = [];
        return;
      }

      // Get the actual listings
      const listingIds = favoriteData.map(f => f.listing_id);
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          category,
          condition,
          price,
          municipio,
          images,
          is_active,
          created_at,
          updated_at,
          user_id,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .in('id', listingIds)
        .eq('is_active', true);

      if (listingsError) throw listingsError;

      // Combine the data
      favorites = (listingsData || []).map(listing => {
        const favoriteInfo = favoriteData.find(f => f.listing_id === listing.id);
        return {
          ...listing,
          favorited_at: favoriteInfo?.created_at || ''
        };
      });

    } catch (err: any) {
      error = err.message || 'Error al cargar favoritos';
      console.error('Error loading favorites:', err);
    } finally {
      loading = false;
    }
  }

  async function removeFavorite(listingId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (deleteError) throw deleteError;

      // Remove from local state
      favorites = favorites.filter(item => item.id !== listingId);
    } catch (err: any) {
      console.error('Error removing favorite:', err);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoy';
    } else if (diffDays === 2) {
      return 'Ayer';
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`;
    } else {
      return date.toLocaleDateString('es-PR');
    }
  }

  function getConditionColor(condition: string): string {
    switch (condition) {
      case 'New': return 'text-success-600 bg-success-50';
      case 'Like New': return 'text-success-600 bg-success-50';
      case 'Good': return 'text-warning-600 bg-warning-50';
      case 'Fair': return 'text-warning-600 bg-warning-50';
      case 'For Parts': return 'text-error-600 bg-error-50';
      default: return 'text-surface-600 bg-surface-50';
    }
  }
</script>

<svelte:head>
  <title>Mis Favoritos - MercaTech</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-3xl font-bold text-surface-900 mb-2">Mis Favoritos</h1>
      <p class="text-surface-600">Productos que has guardado como favoritos</p>
    </div>
    
    <button 
      onclick={() => goto('/')}
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Volver al Inicio
    </button>
  </div>

  <!-- Results Header -->
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold text-surface-900">
      Tus productos favoritos
      {#if !loading}
        <span class="text-surface-500 font-normal">({filteredFavorites.length})</span>
      {/if}
    </h2>
  </div>

  <!-- Filters Section -->
  {#if !loading && favorites.length > 0}
    <div class="bg-white rounded-xl border border-surface-200 p-4 mb-6">
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
          <label for="category-select" class="block text-sm font-medium text-surface-700 mb-2">Categoría</label>
          <select 
            id="category-select"
            bind:value={selectedCategory}
            class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <!-- Condition Filter -->
        <div>
          <label for="condition-select" class="block text-sm font-medium text-surface-700 mb-2">Condición</label>
          <select 
            id="condition-select"
            bind:value={selectedCondition}
            class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las condiciones</option>
            {#each conditions as condition}
              <option value={condition}>{condition}</option>
            {/each}
          </select>
        </div>

        <!-- Municipality Filter -->
        <div>
          <label for="municipio-select" class="block text-sm font-medium text-surface-700 mb-2">Municipio</label>
          <select 
            id="municipio-select"
            bind:value={selectedMunicipio}
            class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los municipios</option>
            {#each municipios as municipio}
              <option value={municipio}>{municipio}</option>
            {/each}
          </select>
        </div>

        <!-- Price Range -->
        <div>
          <label for="min-price" class="block text-sm font-medium text-surface-700 mb-2">Precio mínimo</label>
          <input 
            id="min-price"
            type="number" 
            bind:value={minPrice}
            placeholder="$0"
            class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label for="max-price" class="block text-sm font-medium text-surface-700 mb-2">Precio máximo</label>
          <input 
            id="max-price"
            type="number" 
            bind:value={maxPrice}
            placeholder="Sin límite"
            class="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Sort Options -->
      <div class="mt-4 pt-4 border-t border-surface-200">
        <h3 class="block text-sm font-medium text-surface-700 mb-2">Ordenar por</h3>
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
  {/if}

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
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Error al cargar favoritos</h3>
      <p class="text-surface-600 mb-4">{error}</p>
      <button onclick={loadFavorites} class="btn variant-filled-primary">
        Intentar de nuevo
      </button>
    </div>
  {:else if filteredFavorites.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <div class="mx-auto h-16 w-16 rounded-full bg-surface-100 flex items-center justify-center mb-4">
        <svg class="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">No tienes favoritos aún</h3>
      <p class="text-surface-600 mb-4">
        Explora productos y guarda tus favoritos para encontrarlos fácilmente más tarde.
      </p>
      <button 
        onclick={() => goto('/')}
        class="btn variant-filled-primary"
      >
        Explorar Productos
      </button>
    </div>
  {:else}
    <!-- Favorites Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each filteredFavorites as listing (listing.id)}
        <a href="/listing/{listing.id}" class="block group">
          <div class="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden hover:shadow-md transition-shadow">
            <!-- Image -->
            <div class="relative aspect-square bg-surface-100">
              {#if listing.images && listing.images.length > 0}
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              {:else}
                <!-- Placeholder -->
                <div class="w-full h-full flex items-center justify-center">
                  <svg class="h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}

              <!-- Remove from favorites button -->
              <button
                onclick={(e) => {
                  e.preventDefault();
                  removeFavorite(listing.id);
                }}
                class="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                title="Quitar de favoritos"
                aria-label="Quitar de favoritos"
              >
                <svg class="h-5 w-5 text-error-500 fill-current" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>

              <!-- Condition Badge -->
              <div class="absolute top-3 left-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full {getConditionColor(listing.condition)}">
                  {listing.condition}
                </span>
              </div>

              <!-- Favorited Badge -->
              <div class="absolute bottom-3 left-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                  Favorito {formatDate(listing.favorited_at)}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <!-- Title -->
              <h3 class="font-semibold text-surface-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                {listing.title}
              </h3>

              <!-- Price -->
              <div class="text-2xl font-bold text-primary-600 mb-2">
                {formatPrice(listing.price)}
              </div>

              <!-- Location and Date -->
              <div class="flex items-center justify-between text-sm text-surface-500 mb-3">
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="truncate">{listing.municipio}</span>
                </div>
                <span>{formatDate(listing.created_at)}</span>
              </div>

              <!-- Seller Info -->
              {#if listing.profile}
                <div class="flex items-center text-sm text-surface-600">
                  <div class="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                    <span class="text-xs font-medium text-primary-700">
                      {listing.profile.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span class="truncate">{listing.profile.display_name}</span>
                </div>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
