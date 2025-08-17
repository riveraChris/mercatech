<!-- Create Listing -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { CATEGORIES, CONDITIONS, MUNICIPIOS } from '$lib/types';
  import type { CreateListingForm } from '$lib/types';
  import ImageUploader from '$lib/components/ImageUploader.svelte';

  let loading = false;
  let error = '';
  let success = false;

  let form: CreateListingForm = {
    title: '',
    description: '',
    category: 'Smartphones',
    condition: 'Good',
    price: 0,
    municipio: 'San Juan',
    images: []
  };

  // Redirect if not authenticated
  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading && (!$auth.user || !$auth.profile)) {
        goto('/auth');
      }
    });

    return unsubscribe;
  });

  function handleImagesChange(images: File[]) {
    form.images = images;
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

    if (form.images.length === 0) {
      error = 'Debes subir al menos una imagen';
      return;
    }

    try {
      loading = true;
      error = '';

      // Upload images first
      let imageUrls: string[] = [];
      if (form.images.length > 0) {
        // Use the upload function from ImageUploader component
        const uploadImages = (window as any).uploadImages;
        if (uploadImages) {
          imageUrls = await uploadImages();
        }
      }

      // Create listing
      const { data, error: insertError } = await supabase
        .from('listings')
        .insert({
          user_id: $auth.user!.id,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          condition: form.condition,
          price: form.price,
          municipio: form.municipio,
          images: imageUrls,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      success = true;
      
      // Redirect to the new listing after a short delay
      setTimeout(() => {
        goto(`/listing/${data.id}`);
      }, 2000);

    } catch (err: any) {
      error = err.message || 'Error al crear la publicación';
      console.error('Error creating listing:', err);
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    form = {
      title: '',
      description: '',
      category: 'Smartphones',
      condition: 'Good',
      price: 0,
      municipio: $auth.profile?.municipio || 'San Juan',
      images: []
    };
    error = '';
    success = false;
  }
</script>

<svelte:head>
  <title>Publicar Producto - MercaTech</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-surface-900 mb-2">Publicar Producto</h1>
    <p class="text-surface-600">Completa la información de tu producto para publicarlo en MercaTech</p>
  </div>

  <!-- Success Message -->
  {#if success}
    <div class="mb-6 rounded-lg bg-success-50 p-6 border border-success-200">
      <div class="flex items-center">
        <svg class="h-6 w-6 text-success-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-semibold text-success-900 mb-1">¡Producto publicado!</h3>
          <p class="text-success-700">Tu producto ha sido publicado exitosamente. Serás redirigido en unos segundos...</p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-8">
      <!-- Error Message -->
      {#if error}
        <div class="rounded-lg bg-error-50 p-4 border border-error-200">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-error-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-error-700 text-sm">{error}</p>
          </div>
        </div>
      {/if}

      <!-- Basic Information -->
      <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
        <h2 class="text-xl font-semibold text-surface-900 mb-6">Información Básica</h2>
        
        <div class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-surface-700 mb-2">
              Título del producto *
            </label>
            <input
              id="title"
              type="text"
              bind:value={form.title}
              placeholder="Ej: iPhone 15 Pro Max 256GB Azul Titanio"
              required
              maxlength="100"
              class="input w-full"
              disabled={loading}
            />
            <p class="text-xs text-surface-500 mt-1">{form.title.length}/100 caracteres</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-surface-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              bind:value={form.description}
              placeholder="Describe tu producto: estado, características, razón de venta, etc."
              required
              rows="4"
              maxlength="1000"
              class="textarea w-full"
              disabled={loading}
            ></textarea>
            <p class="text-xs text-surface-500 mt-1">{form.description.length}/1000 caracteres</p>
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
                disabled={loading}
              >
                {#each CATEGORIES as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="condition" class="block text-sm font-medium text-surface-700 mb-2">
                Estado *
              </label>
              <select
                id="condition"
                bind:value={form.condition}
                required
                class="select w-full"
                disabled={loading}
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
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-surface-500 sm:text-sm">$</span>
                </div>
                <input
                  id="price"
                  type="number"
                  bind:value={form.price}
                  placeholder="0"
                  required
                  min="1"
                  step="0.01"
                  class="input w-full pl-7"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label for="municipio" class="block text-sm font-medium text-surface-700 mb-2">
                Municipio *
              </label>
              <select
                id="municipio"
                bind:value={form.municipio}
                required
                class="select w-full"
                disabled={loading}
              >
                {#each MUNICIPIOS as municipio}
                  <option value={municipio}>{municipio}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Images -->
      <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
        <h2 class="text-xl font-semibold text-surface-900 mb-6">Imágenes *</h2>
        <ImageUploader 
          images={form.images} 
          onImagesChange={handleImagesChange}
          maxImages={5}
        />
        <p class="text-xs text-surface-500 mt-2">
          La primera imagen será la imagen principal que aparecerá en los resultados de búsqueda.
        </p>
      </div>

      <!-- Submit Buttons -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={loading}
          class="btn variant-filled-primary flex-1"
        >
          {#if loading}
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
          {/if}
          Publicar Producto
        </button>

        <button
          type="button"
          on:click={resetForm}
          disabled={loading}
          class="btn variant-outline-surface"
        >
          Limpiar Formulario
        </button>
      </div>
    </form>
  {/if}
</div>