<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { CATEGORIES, MUNICIPIOS, CONDITIONS } from '$lib/types';
  import type { Listing, Category, Condition, Municipio } from '$lib/types';

  let listing: Listing | null = null;
  let loading = true;
  let saving = false;
  let error = '';
  let success = '';

  // Form data
  let form = {
    title: '',
    description: '',
    category: 'Smartphones' as Category,
    condition: 'Good' as Condition,
    price: 0,
    municipio: 'San Juan' as Municipio
  };

  // Image handling
  let existingImages: string[] = [];
  let newImages: File[] = [];
  let imagesToDelete: string[] = [];
  let uploadingImages = false;

  $: listingId = $page.params.id;

  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading) {
        if (!$auth.user) {
          goto('/auth');
        } else if (!$auth.profile) {
          goto('/profile/setup');
        } else {
          loadListing();
        }
      }
    });

    return unsubscribe;
  });

  async function loadListing() {
    try {
      loading = true;
      error = '';

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('user_id', user.id) // Ensure user owns this listing
        .single();

      if (fetchError) throw fetchError;

      listing = data;
      
      // Populate form with existing data
      form = {
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        price: data.price,
        municipio: data.municipio
      };

      existingImages = data.images || [];
    } catch (err: any) {
      error = err.message || 'Error al cargar la publicación';
      console.error('Error loading listing:', err);
    } finally {
      loading = false;
    }
  }

  function handleImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    
    // Validate total images (existing + new - deleted)
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length;
    if (totalImages > 10) {
      error = 'Máximo 10 imágenes permitidas';
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        error = 'Solo se permiten archivos de imagen';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        error = 'Las imágenes deben ser menores a 5MB';
        return;
      }
    }

    newImages = [...newImages, ...files];
    error = '';
  }

  function removeExistingImage(imageUrl: string) {
    imagesToDelete = [...imagesToDelete, imageUrl];
  }

  function restoreExistingImage(imageUrl: string) {
    imagesToDelete = imagesToDelete.filter(url => url !== imageUrl);
  }

  function removeNewImage(index: number) {
    newImages = newImages.filter((_, i) => i !== index);
  }

  async function uploadNewImages(): Promise<string[]> {
    if (newImages.length === 0) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    uploadingImages = true;
    const uploadedUrls: string[] = [];

    try {
      for (const file of newImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }
    } finally {
      uploadingImages = false;
    }

    return uploadedUrls;
  }

  async function handleSubmit() {
    // Validation
    if (!form.title.trim()) {
      error = 'El título es requerido';
      return;
    }
    if (!form.description.trim()) {
      error = 'La descripción es requerida';
      return;
    }
    if (form.price <= 0) {
      error = 'El precio debe ser mayor a $0';
      return;
    }

    const finalImages = existingImages.filter(url => !imagesToDelete.includes(url));
    if (finalImages.length + newImages.length === 0) {
      error = 'Debe incluir al menos una imagen';
      return;
    }

    try {
      saving = true;
      error = '';
      success = '';

      // Upload new images
      const uploadedUrls = await uploadNewImages();
      
      // Combine existing (not deleted) + new uploaded images
      const allImages = [...finalImages, ...uploadedUrls];

      // Update listing
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          condition: form.condition,
          price: form.price,
          municipio: form.municipio,
          images: allImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      success = 'Publicación actualizada exitosamente';
      
      // Redirect to listing detail after short delay
      setTimeout(() => {
        goto(`/listing/${listingId}`);
      }, 1500);

    } catch (err: any) {
      error = err.message || 'Error al actualizar la publicación';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Editar Publicación - MercaTech</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 pb-20 md:pb-8">
  <div class="max-w-2xl mx-auto px-4 py-8">
    <!-- Back Navigation -->
    <div class="flex items-center justify-between mb-8">
      <nav class="flex items-center space-x-2 text-sm text-surface-500">
        <a href="/my" class="hover:text-primary-600 transition-colors">Mis Publicaciones</a>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-surface-900 font-medium">Editar</span>
      </nav>

      <button 
        on:click={() => goto('/my')}
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>
    </div>

    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">Editar Publicación</h1>
      <p class="text-surface-600">Actualiza la información de tu producto</p>
    </div>

    {#if loading}
      <!-- Loading State -->
      <div class="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
        <div class="space-y-6">
          <div class="h-4 bg-surface-200 rounded w-1/4"></div>
          <div class="h-10 bg-surface-200 rounded"></div>
          <div class="h-4 bg-surface-200 rounded w-1/4"></div>
          <div class="h-24 bg-surface-200 rounded"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-10 bg-surface-200 rounded"></div>
            <div class="h-10 bg-surface-200 rounded"></div>
          </div>
        </div>
      </div>
    {:else if error && !listing}
      <!-- Error State -->
      <div class="bg-white rounded-2xl p-8 shadow-sm text-center">
        <div class="mx-auto h-16 w-16 rounded-full bg-error-100 flex items-center justify-center mb-4">
          <svg class="h-8 w-8 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-surface-900 mb-2">Error al cargar</h3>
        <p class="text-surface-600 mb-4">{error}</p>
        <button on:click={() => goto('/my')} class="btn variant-filled-primary">
          Volver a Mis Publicaciones
        </button>
      </div>
    {:else if listing}
      <!-- Edit Form -->
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <!-- Success Message -->
        {#if success}
          <div class="mb-6 rounded-lg bg-success-50 p-4 border border-success-200">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-success-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-success-700 text-sm">{success}</p>
            </div>
          </div>
        {/if}

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

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-surface-700 mb-2">
              Título del producto *
            </label>
            <input
              id="title"
              type="text"
              bind:value={form.title}
              placeholder="Ej: iPhone 14 Pro Max 256GB"
              required
              class="input w-full"
              disabled={saving}
            />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-surface-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              bind:value={form.description}
              placeholder="Describe tu producto en detalle..."
              rows="4"
              required
              class="textarea w-full"
              disabled={saving}
            ></textarea>
          </div>

          <!-- Category and Condition -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="category" class="block text-sm font-medium text-surface-700 mb-2">
                Categoría *
              </label>
              <select
                id="category"
                bind:value={form.category}
                required
                class="select w-full"
                disabled={saving}
              >
                {#each CATEGORIES as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="condition" class="block text-sm font-medium text-surface-700 mb-2">
                Condición *
              </label>
              <select
                id="condition"
                bind:value={form.condition}
                required
                class="select w-full"
                disabled={saving}
              >
                {#each CONDITIONS as condition}
                  <option value={condition}>{condition}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Price and Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="price" class="block text-sm font-medium text-surface-700 mb-2">
                Precio (USD) *
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
                <input
                  id="price"
                  type="number"
                  bind:value={form.price}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                  class="input w-full pl-8"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label for="municipio" class="block text-sm font-medium text-surface-700 mb-2">
                Ubicación *
              </label>
              <select
                id="municipio"
                bind:value={form.municipio}
                required
                class="select w-full"
                disabled={saving}
              >
                {#each MUNICIPIOS as municipio}
                  <option value={municipio}>{municipio}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Images -->
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">
              Imágenes del producto *
            </label>
            
            <!-- Existing Images -->
            {#if existingImages.length > 0}
              <div class="mb-4">
                <h4 class="text-sm font-medium text-surface-600 mb-2">Imágenes actuales:</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {#each existingImages as imageUrl, index}
                    <div class="relative group">
                      <img 
                        src={imageUrl} 
                        alt="Imagen {index + 1}"
                        class="w-full h-24 object-cover rounded-lg border-2 {imagesToDelete.includes(imageUrl) ? 'border-error-300 opacity-50' : 'border-surface-200'}"
                      />
                      {#if imagesToDelete.includes(imageUrl)}
                        <div class="absolute inset-0 bg-error-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span class="text-error-700 text-xs font-medium">Eliminada</span>
                        </div>
                        <button
                          type="button"
                          on:click={() => restoreExistingImage(imageUrl)}
                          class="absolute top-1 right-1 p-1 bg-success-500 text-white rounded-full text-xs hover:bg-success-600"
                          disabled={saving}
                        >
                          ↶
                        </button>
                      {:else}
                        <button
                          type="button"
                          on:click={() => removeExistingImage(imageUrl)}
                          class="absolute top-1 right-1 p-1 bg-error-500 text-white rounded-full text-xs hover:bg-error-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={saving}
                        >
                          ✕
                        </button>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- New Images -->
            {#if newImages.length > 0}
              <div class="mb-4">
                <h4 class="text-sm font-medium text-surface-600 mb-2">Nuevas imágenes:</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {#each newImages as file, index}
                    <div class="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Nueva imagen {index + 1}"
                        class="w-full h-24 object-cover rounded-lg border-2 border-primary-200"
                      />
                      <button
                        type="button"
                        on:click={() => removeNewImage(index)}
                        class="absolute top-1 right-1 p-1 bg-error-500 text-white rounded-full text-xs hover:bg-error-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={saving}
                      >
                        ✕
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Upload New Images -->
            <div class="border-2 border-dashed border-surface-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                on:change={handleImageSelect}
                class="hidden"
                id="image-upload"
                disabled={saving || uploadingImages}
              />
              <label for="image-upload" class="cursor-pointer">
                <div class="space-y-2">
                  <svg class="mx-auto h-12 w-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <div class="text-sm text-surface-600">
                    <span class="font-medium text-primary-600 hover:text-primary-500">Agregar más imágenes</span>
                  </div>
                  <p class="text-xs text-surface-500">PNG, JPG, WebP hasta 5MB cada una</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4 pt-6">
            <button
              type="button"
              on:click={() => goto('/my')}
              class="btn variant-outline-surface flex-1"
              disabled={saving}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving || uploadingImages}
              class="btn variant-filled-primary flex-1"
            >
              {#if saving}
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              {/if}
              {saving ? 'Guardando...' : 'Actualizar Publicación'}
            </button>
          </div>
        </form>
      </div>
    {/if}
  </div>
</div>
