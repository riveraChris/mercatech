<script lang="ts">
  import { authService, auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { MUNICIPIOS, CONTACT_PREFERENCES } from '$lib/types';
  import type { ProfileSetupForm } from '$lib/types';

  let loading = false;
  let error = '';
  let form: ProfileSetupForm = {
    display_name: '',
    municipio: 'San Juan',
    contact_preference: 'WhatsApp',
    contact_info: ''
  };

  // Redirect if not authenticated or already has profile
  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading) {
        if (!$auth.user) {
          goto('/auth');
        } else if ($auth.profile) {
          goto('/');
        }
      }
    });

    return unsubscribe;
  });

  async function handleSubmit() {
    if (!form.display_name.trim()) {
      error = 'Por favor ingresa tu nombre';
      return;
    }

    try {
      loading = true;
      error = '';
      
      await authService.createProfile({
        display_name: form.display_name.trim(),
        municipio: form.municipio,
        contact_preference: form.contact_preference,
        contact_info: form.contact_info.trim() || undefined
      });

      goto('/');
    } catch (err: any) {
      error = err.message || 'Error al crear el perfil';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Configurar Perfil - MercaTech</title>
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
        <h1 class="text-2xl font-bold text-surface-900">Configura tu perfil</h1>
        <p class="text-surface-600 mt-2">Completa tu información para empezar a usar MercaTech</p>
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

      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
          <p class="text-xs text-surface-500 mt-1">
            Esta información será visible para otros usuarios cuando estén interesados en tus productos
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={loading}
          class="btn variant-filled-primary w-full"
        >
          {#if loading}
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
          {/if}
          Crear Perfil
        </button>
      </form>
    </div>
  </div>
</div>
