<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { auth } from '$lib/stores/auth';
  import { v4 as uuidv4 } from 'uuid';

  interface Props {
    images: File[];
    maxImages?: number;
    onImagesChange: (images: File[]) => void;
  }

  let { images, maxImages = 5, onImagesChange }: Props = $props();

  let uploading = $state(false);
  let dragActive = $state(false);
  let fileInput: HTMLInputElement;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      addFiles(Array.from(target.files));
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
    
    if (event.dataTransfer?.files) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
  }

  function addFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`${file.name} no es un tipo de archivo válido. Solo se permiten JPG, PNG y WebP.`);
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} es muy grande. El tamaño máximo es 5MB.`);
        return false;
      }
      
      return true;
    });

    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes.`);
      return;
    }

    onImagesChange([...images, ...validFiles]);
    
    // Reset file input
    if (fileInput) {
      fileInput.value = '';
    }
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }

  function moveImage(fromIndex: number, toIndex: number) {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  }

  async function uploadImages(): Promise<string[]> {
    if (!$auth.user || images.length === 0) return [];

    try {
      uploading = true;
      const uploadPromises = images.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${$auth.user!.id}/${uuidv4()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Error uploading image:', error);
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      uploading = false;
    }
  }

  // Expose upload function to parent
  $effect(() => {
    if (typeof window !== 'undefined') {
      (window as any).uploadImages = uploadImages;
    }
  });
</script>

<div class="space-y-4">
  <!-- Upload Area -->
  <div
    class="border-2 border-dashed rounded-lg p-6 text-center transition-colors {dragActive ? 'border-primary-500 bg-primary-50' : 'border-surface-300 hover:border-surface-400'}"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
  >
    {#if images.length === 0}
      <div class="space-y-4">
        <div class="mx-auto h-12 w-12 rounded-full bg-surface-100 flex items-center justify-center">
          <svg class="h-6 w-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-surface-600 mb-2">Arrastra imágenes aquí o</p>
          <button
            type="button"
            on:click={() => fileInput.click()}
            class="btn variant-outline-primary"
          >
            Seleccionar Archivos
          </button>
        </div>
        <p class="text-xs text-surface-500">
          JPG, PNG, WebP hasta 5MB cada una. Máximo {maxImages} imágenes.
        </p>
      </div>
    {:else}
      <button
        type="button"
        on:click={() => fileInput.click()}
        class="btn variant-outline-primary"
        disabled={images.length >= maxImages}
      >
        {#if images.length >= maxImages}
          Máximo de imágenes alcanzado
        {:else}
          Agregar más imágenes ({images.length}/{maxImages})
        {/if}
      </button>
    {/if}
  </div>

  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    multiple
    accept="image/jpeg,image/jpg,image/png,image/webp"
    on:change={handleFileSelect}
    class="hidden"
  />

  <!-- Image Preview Grid -->
  {#if images.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {#each images as image, index (image.name + index)}
        <div class="relative group">
          <div class="aspect-square rounded-lg overflow-hidden bg-surface-100">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview {index + 1}"
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Image Controls -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
            <!-- Move Left -->
            {#if index > 0}
              <button
                type="button"
                on:click={() => moveImage(index, index - 1)}
                class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Mover a la izquierda"
              >
                <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            {/if}

            <!-- Remove -->
            <button
              type="button"
              on:click={() => removeImage(index)}
              class="p-2 bg-error-500/80 rounded-full hover:bg-error-500 transition-colors"
              title="Eliminar imagen"
            >
              <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <!-- Move Right -->
            {#if index < images.length - 1}
              <button
                type="button"
                on:click={() => moveImage(index, index + 1)}
                class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Mover a la derecha"
              >
                <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/if}
          </div>

          <!-- Primary Image Badge -->
          {#if index === 0}
            <div class="absolute top-2 left-2">
              <span class="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                Principal
              </span>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Upload Status -->
    {#if uploading}
      <div class="flex items-center justify-center space-x-2 text-primary-600">
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
        <span class="text-sm">Subiendo imágenes...</span>
      </div>
    {/if}
  {/if}
</div>