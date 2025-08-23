<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import type { Listing } from '$lib/types';

  let soldListings: Listing[] = $state([]);
  let loading = $state(true);
  let currentIndex = $state(0);
  let carouselContainer: HTMLElement | undefined = $state();

  onMount(() => {
    loadSoldListings();
    startAutoScroll();
  });

  async function loadSoldListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(display_name, avatar_url)
        `)
        .eq('is_sold', true)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      soldListings = data || [];
    } catch (err) {
      console.error('Error loading sold listings:', err);
    } finally {
      loading = false;
    }
  }

  function startAutoScroll() {
    setInterval(() => {
      if (soldListings.length > 0) {
        currentIndex = (currentIndex + 1) % soldListings.length;
        scrollToIndex(currentIndex);
      }
    }, 3000);
  }

  function scrollToIndex(index: number) {
    if (carouselContainer) {
      const itemWidth = 280; // Width of each card + gap
      carouselContainer.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PR', {
      month: 'short',
      day: 'numeric'
    });
  }
</script>

{#if !loading && soldListings.length > 0}
  <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold text-surface-900">Vendidos Recientemente</h2>
        <p class="text-sm text-surface-600">Productos que otros usuarios han vendido exitosamente</p>
      </div>
      <div class="flex items-center text-sm text-success-600">
        <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-medium">{soldListings.length} vendidos</span>
      </div>
    </div>

    <div 
      bind:this={carouselContainer}
      class="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      style="scroll-snap-type: x mandatory;"
    >
      {#each soldListings as listing (listing.id)}
        <div class="flex-shrink-0 w-64 bg-surface-50 rounded-lg p-4 border border-surface-100" style="scroll-snap-align: start;">
          <div class="flex items-start gap-3">
            <!-- Image -->
            <div class="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-200 flex-shrink-0">
              {#if listing.images && listing.images.length > 0}
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center">
                  <svg class="h-6 w-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
              
              <!-- Sold Badge -->
              <div class="absolute -top-1 -right-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  ✓ Vendido
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-surface-900 text-sm line-clamp-2 mb-1">
                {listing.title}
              </h3>
              <p class="text-lg font-bold text-success-600 mb-1">
                {formatPrice(listing.price)}
              </p>
              <div class="flex items-center justify-between text-xs text-surface-500">
                <span>{listing.municipio}</span>
                <span>{formatDate(listing.updated_at)}</span>
              </div>
              
              <!-- Seller -->
              {#if listing.profile}
                <div class="flex items-center mt-2 text-xs text-surface-600">
                  {#if listing.profile.avatar_url}
                    <img 
                      src={listing.profile.avatar_url} 
                      alt={listing.profile.display_name}
                      class="h-4 w-4 rounded-full object-cover mr-1"
                    />
                  {:else}
                    <div class="h-4 w-4 rounded-full bg-primary-100 flex items-center justify-center mr-1">
                      <span class="text-xs font-medium text-primary-700">
                        {listing.profile.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  {/if}
                  <span class="truncate">Vendido por {listing.profile.display_name}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
</style>
