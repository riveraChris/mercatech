<script lang="ts">
  import { authService } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import Logo from '$lib/components/Logo.svelte';

  let loading = false;
  let error = '';

  // Redirect if already authenticated
  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading && $auth.user && $auth.profile) {
        goto('/');
      }
    });

    return unsubscribe;
  });

  async function signInWithGoogle() {
    try {
      loading = true;
      error = '';
      await authService.signInWithGoogle();
    } catch (err: any) {
      error = err.message || 'Failed to sign in with Google';
      loading = false;
    }
  }

  async function signInWithApple() {
    try {
      loading = true;
      error = '';
      await authService.signInWithApple();
    } catch (err: any) {
      error = err.message || 'Failed to sign in with Apple';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - MercaTech</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
  <div class="w-full max-w-md">
    <div class="rounded-2xl bg-white p-8 shadow-xl">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <Logo size="lg" variant="color" />
        </div>
        <p class="text-surface-600 mt-2">Tu marketplace de electrónicos en Puerto Rico</p>
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

      <!-- Sign In Options -->
      <div class="space-y-4">
        <button
          on:click={signInWithGoogle}
          disabled={loading}
          class="w-full flex items-center justify-center px-4 py-3 border border-surface-300 rounded-lg shadow-sm bg-white text-surface-700 font-medium hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if loading}
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-surface-300 border-t-surface-600 mr-3"></div>
          {:else}
            <svg class="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          {/if}
          Continuar con Google
        </button>

        <!-- Apple OAuth temporarily disabled -->
        <!-- 
        <button
          on:click={signInWithApple}
          disabled={loading}
          class="w-full flex items-center justify-center px-4 py-3 border border-surface-900 rounded-lg shadow-sm bg-surface-900 text-white font-medium hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if loading}
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-surface-300 border-t-white mr-3"></div>
          {:else}
            <svg class="h-5 w-5 mr-3 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          {/if}
          Continuar con Apple
        </button>
        -->
      </div>

      <!-- Terms -->
      <p class="mt-8 text-center text-xs text-surface-500">
        Al continuar, aceptas nuestros 
        <a href="/terms" class="text-primary-600 hover:text-primary-500">Términos de Servicio</a>
        y 
        <a href="/privacy" class="text-primary-600 hover:text-primary-500">Política de Privacidad</a>
      </p>
    </div>
  </div>
</div>
