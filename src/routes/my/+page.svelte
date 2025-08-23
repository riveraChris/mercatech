<!-- My Listings -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import type { Listing } from '$lib/types';

  let listings: Listing[] = $state([]);
  let loading = $state(true);
  let error = $state('');
  let filter = $state<'all' | 'active' | 'inactive'>('all');

  // Redirect if not authenticated
  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading) {
        if (!$auth.user) {
          goto('/auth');
        } else if (!$auth.profile) {
          goto('/profile/setup');
        } else {
          loadMyListings();
        }
      }
    });

    return unsubscribe;
  });

  async function loadMyListings() {
    try {
      loading = true;
      error = '';

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      listings = data || [];
    } catch (err: any) {
      error = err.message || 'Error al cargar tus publicaciones';
    } finally {
      loading = false;
    }
  }

  async function toggleListingStatus(listingId: string, currentStatus: boolean) {
    try {
      const { error: updateError } = await supabase
        .from('listings')
        .update({ is_active: !currentStatus })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Update local state
      listings = listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, is_active: !currentStatus }
          : listing
      );
    } catch (err: any) {
      error = err.message || 'Error al actualizar el estado';
    }
  }

  async function toggleSoldStatus(listingId: string, currentSoldStatus: boolean) {
    try {
      const { error: updateError } = await supabase
        .from('listings')
        .update({ is_sold: !currentSoldStatus })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Update local state
      listings = listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, is_sold: !currentSoldStatus }
          : listing
      );
    } catch (err: any) {
      error = err.message || 'Error al actualizar el estado de venta';
    }
  }

  async function deleteListing(listingId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (deleteError) throw deleteError;

      // Remove from local state
      listings = listings.filter(listing => listing.id !== listingId);
    } catch (err: any) {
      error = err.message || 'Error al eliminar la publicación';
    }
  }

  function editListing(listingId: string) {
    goto(`/listing/${listingId}/edit`);
  }

  function viewListing(listingId: string) {
    goto(`/listing/${listingId}`);
  }

  const filteredListings = $derived(() => {
    if (filter === 'active') return listings.filter(l => l.is_active);
    if (filter === 'inactive') return listings.filter(l => !l.is_active);
    return listings;
  });

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Mis Publicaciones - MercaTech</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 pb-20 md:pb-8">
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">Mis Publicaciones</h1>
      <p class="text-surface-600">Administra tus productos publicados</p>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="mb-6 rounded-lg bg-error-50 p-4 border border-error-200">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-error-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-error-700 text-sm">{error}</p>
        </div>
      </div>
    {/if}

    <!-- Actions Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <!-- Filter Tabs -->
      <div class="flex bg-surface-100 rounded-lg p-1">
        <button
          onclick={() => filter = 'all'}
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors {filter === 'all' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}"
        >
          Todas ({listings.length})
        </button>
        <button
          onclick={() => filter = 'active'}
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors {filter === 'active' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}"
        >
          Activas ({listings.filter(l => l.is_active).length})
        </button>
        <button
          onclick={() => filter = 'inactive'}
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors {filter === 'inactive' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'}"
        >
          Inactivas ({listings.filter(l => !l.is_active).length})
        </button>
      </div>

      <!-- New Listing Button -->
      <a href="/post" class="btn variant-filled-primary">
        <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Publicación
      </a>
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="space-y-4">
        {#each Array(3) as _}
          <div class="bg-white rounded-lg p-6 shadow-sm animate-pulse">
            <div class="flex gap-4">
              <div class="w-24 h-24 bg-surface-200 rounded-lg"></div>
              <div class="flex-1 space-y-3">
                <div class="h-4 bg-surface-200 rounded w-3/4"></div>
                <div class="h-3 bg-surface-200 rounded w-1/2"></div>
                <div class="h-3 bg-surface-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if filteredListings().length === 0}
      <!-- Empty State -->
      <div class="text-center py-12">
        <div class="mx-auto h-24 w-24 rounded-full bg-surface-100 flex items-center justify-center mb-4">
          <svg class="h-12 w-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-surface-900 mb-2">
          {filter === 'all' ? 'No tienes publicaciones' : 
           filter === 'active' ? 'No tienes publicaciones activas' : 
           'No tienes publicaciones inactivas'}
        </h3>
        <p class="text-surface-600 mb-6">
          {filter === 'all' ? 'Crea tu primera publicación para empezar a vender' : 
           filter === 'active' ? 'Activa algunas publicaciones para que sean visibles' : 
           'Las publicaciones inactivas no son visibles para otros usuarios'}
        </p>
        {#if filter === 'all'}
          <a href="/post" class="btn variant-filled-primary">
            Crear Primera Publicación
          </a>
        {/if}
      </div>
    {:else}
      <!-- Listings Grid -->
      <div class="space-y-4">
        {#each filteredListings() as listing (listing.id)}
          <div class="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden">
            <div class="p-6">
              <div class="flex gap-4">
                <!-- Image -->
                <div class="flex-shrink-0">
                  {#if listing.images && listing.images.length > 0}
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      class="w-24 h-24 object-cover rounded-lg"
                    />
                  {:else}
                    <div class="w-24 h-24 bg-surface-100 rounded-lg flex items-center justify-center">
                      <svg class="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-surface-900 mb-1 truncate">
                        {listing.title}
                      </h3>
                      <p class="text-xl font-bold text-primary-600 mb-2">
                        {formatPrice(listing.price)}
                      </p>
                      <div class="flex items-center gap-4 text-sm text-surface-500">
                        <span class="flex items-center">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {listing.municipio}
                        </span>
                        <span class="flex items-center">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(listing.created_at)}
                        </span>
                      </div>
                    </div>

                    <!-- Status Badges -->
                    <div class="flex items-center gap-2 ml-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {listing.is_active ? 'bg-success-100 text-success-800' : 'bg-surface-100 text-surface-800'}">
                        {listing.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                      {#if listing.is_sold}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          Vendido
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-4 flex items-center justify-between pt-4 border-t border-surface-200">
                <div class="flex items-center gap-4">
                  <button
                    onclick={() => viewListing(listing.id)}
                    class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onclick={() => editListing(listing.id)}
                    class="text-sm text-surface-600 hover:text-surface-700 font-medium"
                  >
                    Editar
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    onclick={() => toggleSoldStatus(listing.id, listing.is_sold)}
                    class="text-sm font-medium {listing.is_sold ? 'text-success-600 hover:text-success-700' : 'text-warning-600 hover:text-warning-700'}"
                  >
                    {listing.is_sold ? 'Marcar Disponible' : 'Marcar Vendido'}
                  </button>
                  <button
                    onclick={() => toggleListingStatus(listing.id, listing.is_active)}
                    class="text-sm font-medium {listing.is_active ? 'text-warning-600 hover:text-warning-700' : 'text-success-600 hover:text-success-700'}"
                  >
                    {listing.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onclick={() => deleteListing(listing.id)}
                    class="text-sm text-error-600 hover:text-error-700 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>