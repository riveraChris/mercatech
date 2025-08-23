<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import type { Listing } from '$lib/types';

  interface Props {
    listing: Listing;
  }

  let { listing }: Props = $props();

  let isFavorited = $state(false);
  let favoriteLoading = $state(false);

  // Check if listing is favorited by current user
  $effect(() => {
    async function checkFavoriteStatus() {
      if ($auth.user) {
        try {
          const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', $auth.user.id)
            .eq('listing_id', listing.id)
            .single();
          
          isFavorited = !!data;
        } catch (error) {
          // Not favorited or error
          isFavorited = false;
        }
      }
    }
    
    checkFavoriteStatus();
  });

  async function toggleFavorite(event: Event) {
    event.preventDefault();
    if (!$auth.user || favoriteLoading) return;

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

      <!-- Favorite Button -->
      {#if $auth.user && $auth.user.id !== listing.user_id}
        <button
          onclick={toggleFavorite}
          disabled={favoriteLoading}
          class="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
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
      {/if}

      <!-- Condition Badge -->
      <div class="absolute top-3 left-3">
        <span class="px-2 py-1 text-xs font-medium rounded-full {getConditionColor(listing.condition)}">
          {listing.condition}
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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

<style>
  .line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>