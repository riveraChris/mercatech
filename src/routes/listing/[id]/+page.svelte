<!-- Listing Details -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import type { Listing, Report } from '$lib/types';

  let listing: Listing | null = null;
  let loading = true;
  let error = '';
  let isFavorited = false;
  let favoriteLoading = false;
  let currentImageIndex = 0;
  let showReportModal = false;
  let reportReason = '';
  let reportDescription = '';
  let reportLoading = false;

  $: listingId = $page.params.id;

  onMount(() => {
    loadListing();
    checkIfFavorited();
  });

  async function loadListing() {
    try {
      loading = true;
      error = '';

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(display_name, municipio, contact_preference, contact_info)
        `)
        .eq('id', listingId)
        .eq('is_active', true)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      listing = data;
    } catch (err: any) {
      error = err.message || 'Error loading listing';
      console.error('Error loading listing:', err);
    } finally {
      loading = false;
    }
  }

  async function checkIfFavorited() {
    if (!$auth.user || !listingId) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', $auth.user.id)
        .eq('listing_id', listingId)
        .single();
      
      isFavorited = !!data;
    } catch (error) {
      // Not favorited or error
      isFavorited = false;
    }
  }

  async function toggleFavorite() {
    if (!$auth.user || favoriteLoading || !listing) return;

    try {
      favoriteLoading = true;

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', $auth.user.id)
          .eq('listing_id', listing.id);

        if (error) throw error;
        isFavorited = false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: $auth.user.id,
            listing_id: listing.id
          });

        if (error) throw error;
        isFavorited = true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      favoriteLoading = false;
    }
  }

  function nextImage() {
    if (listing && listing.images.length > 1) {
      currentImageIndex = (currentImageIndex + 1) % listing.images.length;
    }
  }

  function prevImage() {
    if (listing && listing.images.length > 1) {
      currentImageIndex = currentImageIndex === 0 ? listing.images.length - 1 : currentImageIndex - 1;
    }
  }

  function selectImage(index: number) {
    currentImageIndex = index;
  }

  async function submitReport() {
    if (!$auth.user || !listing || !reportReason.trim()) return;

    try {
      reportLoading = true;

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: $auth.user.id,
          listing_id: listing.id,
          reason: reportReason.trim(),
          description: reportDescription.trim() || null
        });

      if (error) throw error;

      showReportModal = false;
      reportReason = '';
      reportDescription = '';
      
      // Show success message
      alert('Reporte enviado exitosamente. Revisaremos tu reporte pronto.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error al enviar el reporte. Inténtalo de nuevo.');
    } finally {
      reportLoading = false;
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
    return new Date(dateString).toLocaleDateString('es-PR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  function handleContact() {
    if (!listing?.profile) return;

    const { contact_preference, contact_info } = listing.profile;
    const message = `Hola! Estoy interesado en tu producto: ${listing.title}`;

    switch (contact_preference) {
      case 'WhatsApp':
        if (contact_info) {
          const phone = contact_info.replace(/\D/g, '');
          window.open(`https://wa.me/1${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
        break;
      case 'Email':
        if (contact_info) {
          window.open(`mailto:${contact_info}?subject=${encodeURIComponent(listing.title)}&body=${encodeURIComponent(message)}`, '_blank');
        }
        break;
      case 'Phone':
        if (contact_info) {
          window.open(`tel:${contact_info}`, '_blank');
        }
        break;
      default:
        alert('Información de contacto no disponible');
    }
  }
</script>

<svelte:head>
  <title>{listing ? listing.title : 'Cargando...'} - MercaTech</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
  <!-- Back Navigation -->
  <div class="flex items-center justify-between mb-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center space-x-2 text-sm text-surface-500">
      <a href="/" class="hover:text-primary-600 transition-colors">Inicio</a>
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-surface-900 font-medium">
        {listing ? listing.title : 'Producto'}
      </span>
    </nav>

    <!-- Back Button -->
    <button 
      onclick={() => window.history.back()}
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Volver
    </button>
  </div>

  {#if loading}
    <!-- Loading State -->
    <div class="animate-pulse">
      <div class="bg-surface-200 h-96 rounded-xl mb-6"></div>
      <div class="space-y-4">
        <div class="bg-surface-200 h-8 rounded w-3/4"></div>
        <div class="bg-surface-200 h-6 rounded w-1/2"></div>
        <div class="bg-surface-200 h-4 rounded w-full"></div>
        <div class="bg-surface-200 h-4 rounded w-2/3"></div>
      </div>
    </div>
  {:else if error}
    <!-- Error State -->
    <div class="text-center py-12">
      <div class="mx-auto h-16 w-16 rounded-full bg-error-100 flex items-center justify-center mb-4">
        <svg class="h-8 w-8 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Producto no encontrado</h3>
      <p class="text-surface-600 mb-4">{error}</p>
      <button onclick={() => goto('/')} class="btn variant-filled-primary">
        Volver al inicio
      </button>
    </div>
  {:else if listing}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Image Carousel -->
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="relative aspect-square bg-surface-100 rounded-xl overflow-hidden">
          {#if listing.images && listing.images.length > 0}
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              class="w-full h-full object-cover"
            />
            
            <!-- Navigation Arrows -->
            {#if listing.images.length > 1}
              <button
                onclick={prevImage}
                class="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Imagen anterior"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onclick={nextImage}
                class="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Siguiente imagen"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Image Counter -->
              <div class="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                {currentImageIndex + 1} / {listing.images.length}
              </div>
            {/if}
          {:else}
            <!-- Placeholder -->
            <div class="w-full h-full flex items-center justify-center">
              <svg class="h-16 w-16 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          {/if}
        </div>

        <!-- Thumbnail Strip -->
        {#if listing.images && listing.images.length > 1}
          <div class="flex space-x-2 overflow-x-auto pb-2">
            {#each listing.images as image, index}
              <button
                onclick={() => selectImage(index)}
                class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 {index === currentImageIndex ? 'border-primary-500' : 'border-surface-200'} hover:border-primary-300 transition-colors"
              >
                <img
                  src={image}
                  alt="Thumbnail {index + 1}"
                  class="w-full h-full object-cover"
                />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Product Details -->
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-surface-900 mb-2">{listing.title}</h1>
              <div class="flex items-center space-x-4 text-sm text-surface-500">
                <span class="flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {listing.municipio}
                </span>
                <span>Publicado {formatDate(listing.created_at)}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            {#if $auth.user && $auth.user.id !== listing.user_id}
              <div class="flex space-x-2">
                <!-- Favorite Button -->
                <button
                  onclick={toggleFavorite}
                  disabled={favoriteLoading}
                  class="p-3 rounded-full border border-surface-300 hover:bg-surface-50 transition-colors disabled:opacity-50"
                  aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <svg
                    class="h-5 w-5 {isFavorited ? 'text-error-500 fill-current' : 'text-surface-600'}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <!-- Report Button -->
                <button
                  onclick={() => showReportModal = true}
                  class="p-3 rounded-full border border-surface-300 hover:bg-surface-50 transition-colors"
                  aria-label="Reportar publicación"
                >
                  <svg class="h-5 w-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>

          <!-- Price -->
          <div class="text-4xl font-bold text-primary-600 mb-4">
            {formatPrice(listing.price)}
          </div>

          <!-- Badges -->
          <div class="flex flex-wrap gap-2 mb-6">
            <span class="px-3 py-1 text-sm font-medium rounded-full {getConditionColor(listing.condition)}">
              {listing.condition}
            </span>
            <span class="px-3 py-1 text-sm font-medium rounded-full bg-surface-100 text-surface-700">
              {listing.category}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h2 class="text-xl font-semibold text-surface-900 mb-3">Descripción</h2>
          <p class="text-surface-700 whitespace-pre-wrap">{listing.description}</p>
        </div>

        <!-- Seller Info -->
        {#if listing.profile}
          <div class="bg-surface-50 rounded-xl p-6">
            <h2 class="text-xl font-semibold text-surface-900 mb-4">Vendedor</h2>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-lg font-medium text-primary-700">
                    {listing.profile.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p class="font-semibold text-surface-900">{listing.profile.display_name}</p>
                  <p class="text-sm text-surface-600">{listing.profile.municipio}</p>
                </div>
              </div>

              <!-- Contact Button -->
              {#if $auth.user && $auth.user.id !== listing.user_id}
                <button
                  onclick={handleContact}
                  class="btn variant-filled-primary"
                >
                  <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contactar
                </button>
              {:else if !$auth.user}
                <a href="/auth" class="btn variant-filled-primary">
                  Iniciar Sesión para Contactar
                </a>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Report Modal -->
{#if showReportModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-surface-900 mb-4">Reportar Publicación</h3>
      
      <div class="space-y-4">
        <div>
          <label for="report-reason" class="block text-sm font-medium text-surface-700 mb-2">
            Razón del reporte *
          </label>
          <select bind:value={reportReason} class="select w-full" required>
            <option value="">Selecciona una razón</option>
            <option value="Producto falso">Producto falso</option>
            <option value="Precio sospechoso">Precio sospechoso</option>
            <option value="Contenido inapropiado">Contenido inapropiado</option>
            <option value="Spam">Spam</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label for="report-description" class="block text-sm font-medium text-surface-700 mb-2">
            Descripción adicional
          </label>
          <textarea
            bind:value={reportDescription}
            placeholder="Proporciona más detalles sobre el problema..."
            rows="3"
            class="textarea w-full"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          onclick={() => showReportModal = false}
          class="btn variant-outline-surface"
          disabled={reportLoading}
        >
          Cancelar
        </button>
        <button
          onclick={submitReport}
          disabled={!reportReason.trim() || reportLoading}
          class="btn variant-filled-error"
        >
          {#if reportLoading}
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
          {/if}
          Enviar Reporte
        </button>
      </div>
    </div>
  </div>
{/if}