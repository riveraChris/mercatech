<!-- User Profile -->
<script lang="ts">
  import { authService, auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { MUNICIPIOS, CONTACT_PREFERENCES } from '$lib/types';
  import type { Profile, ContactPreference, Municipio } from '$lib/types';
  import { supabase } from '$lib/supabaseClient';

  let loading = false;
  let saving = false;
  let error = '';
  let success = '';
  let avatarFile: File | null = null;
  let avatarPreview = '';
  let uploadingAvatar = false;

  let form = {
    display_name: '',
    municipio: 'San Juan' as Municipio,
    contact_preference: 'WhatsApp' as ContactPreference,
    contact_info: '',
    avatar_url: ''
  };

  // Redirect if not authenticated
  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading) {
        if (!$auth.user) {
          goto('/auth');
        } else if (!$auth.profile) {
          goto('/profile/setup');
        } else {
          // Populate form with current profile data
          form = {
            display_name: $auth.profile.display_name,
            municipio: $auth.profile.municipio,
            contact_preference: $auth.profile.contact_preference,
            contact_info: $auth.profile.contact_info || '',
            avatar_url: $auth.profile.avatar_url || ''
          };
          avatarPreview = $auth.profile.avatar_url || '';
        }
      }
    });

    return unsubscribe;
  });

  function handleAvatarSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error = 'Por favor selecciona una imagen válida';
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        error = 'La imagen debe ser menor a 5MB';
        return;
      }
      
      avatarFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      error = '';
    }
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarFile) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    
    uploadingAvatar = true;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, avatarFile, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } finally {
      uploadingAvatar = false;
    }
  }

  async function handleSubmit() {
    if (!form.display_name.trim()) {
      error = 'Por favor ingresa tu nombre';
      return;
    }

    try {
      saving = true;
      error = '';
      success = '';
      
      let avatarUrl = form.avatar_url;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      await authService.updateProfile({
        display_name: form.display_name.trim(),
        municipio: form.municipio,
        contact_preference: form.contact_preference,
        contact_info: form.contact_info.trim() || undefined,
        avatar_url: avatarUrl || undefined
      });

      success = 'Perfil actualizado exitosamente';
      avatarFile = null;
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        success = '';
      }, 3000);
      
    } catch (err: any) {
      error = err.message || 'Error al actualizar el perfil';
    } finally {
      saving = false;
    }
  }

  function removeAvatar() {
    avatarFile = null;
    avatarPreview = form.avatar_url;
  }
</script>

<svelte:head>
  <title>Mi Perfil - MercaTech</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
  <div class="mx-auto max-w-md">
    <div class="rounded-2xl bg-white p-8 shadow-xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center mb-4">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-surface-900">Mi Perfil</h1>
        <p class="text-surface-600 mt-2">Actualiza tu información personal</p>
      </div>

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

      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- Avatar Upload -->
        <div class="text-center">
          <div class="relative inline-block">
            {#if avatarPreview}
              <img 
                src={avatarPreview} 
                alt="Avatar preview" 
                class="h-24 w-24 rounded-full object-cover border-4 border-primary-100"
              />
            {:else}
              <div class="h-24 w-24 rounded-full bg-surface-200 flex items-center justify-center border-4 border-primary-100">
                <svg class="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            {/if}
            
            {#if uploadingAvatar}
              <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            {/if}
          </div>
          
          <div class="mt-4 flex justify-center gap-2">
            <label class="btn variant-ghost-primary text-sm cursor-pointer">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Cambiar foto
              <input 
                type="file" 
                accept="image/*" 
                on:change={handleAvatarSelect}
                class="hidden"
                disabled={saving || uploadingAvatar}
              />
            </label>
            
            {#if avatarFile}
              <button 
                type="button" 
                on:click={removeAvatar}
                class="btn variant-ghost-error text-sm"
                disabled={saving || uploadingAvatar}
              >
                Cancelar
              </button>
            {/if}
          </div>
          
          <p class="text-xs text-surface-500 mt-2">
            JPG, PNG o WebP. Máximo 5MB.
          </p>
        </div>

        <!-- Display Name -->
        <div>
          <label for="display_name" class="block text-sm font-medium text-surface-700 mb-2">
            Nombre a mostrar *
          </label>
          <input
            id="display_name"
            type="text"
            bind:value={form.display_name}
            placeholder="Ej: Juan Pérez"
            required
            class="input w-full"
            disabled={saving}
          />
        </div>

        <!-- Municipio -->
        <div>
          <label for="municipio" class="block text-sm font-medium text-surface-700 mb-2">
            Municipio *
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

        <!-- Contact Preference -->
        <div>
          <label for="contact_preference" class="block text-sm font-medium text-surface-700 mb-2">
            Preferencia de contacto *
          </label>
          <select
            id="contact_preference"
            bind:value={form.contact_preference}
            required
            class="select w-full"
            disabled={saving}
          >
            {#each CONTACT_PREFERENCES as preference}
              <option value={preference}>{preference}</option>
            {/each}
          </select>
        </div>

        <!-- Contact Info -->
        <div>
          <label for="contact_info" class="block text-sm font-medium text-surface-700 mb-2">
            Información de contacto
          </label>
          <input
            id="contact_info"
            type="text"
            bind:value={form.contact_info}
            placeholder={form.contact_preference === 'WhatsApp' ? 'Ej: (787) 123-4567' : 
                         form.contact_preference === 'Email' ? 'Ej: juan@email.com' : 
                         'Información de contacto'}
            class="input w-full"
            disabled={saving}
          />
          <p class="text-xs text-surface-500 mt-1">
            Esta información será visible para otros usuarios cuando estén interesados en tus productos
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            on:click={() => goto('/')}
            class="btn variant-ghost-surface flex-1"
            disabled={saving}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            class="btn variant-filled-primary flex-1"
          >
            {#if saving}
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
            {/if}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</div>