<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { auth } from '$lib/stores/auth';

  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      // Handle the OAuth callback
      const { data, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth callback error:', authError);
        error = 'Authentication failed. Please try again.';
        return;
      }

      if (data.session) {
        // Wait for auth store to update
        const unsubscribe = auth.subscribe(($auth) => {
          if (!$auth.loading && $auth.user) {
            unsubscribe();
            
            // Redirect based on profile status
            if ($auth.profile) {
              goto('/');
            } else {
              goto('/profile/setup');
            }
          }
        });
      } else {
        error = 'No session found. Please try signing in again.';
      }
    } catch (err) {
      console.error('Callback error:', err);
      error = 'Something went wrong. Please try again.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-50 px-4">
  <div class="w-full max-w-md text-center">
    {#if loading}
      <div class="flex flex-col items-center space-y-4">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        <p class="text-surface-600">Completing sign in...</p>
      </div>
    {:else if error}
      <div class="rounded-lg bg-error-50 p-6">
        <div class="mx-auto h-12 w-12 rounded-full bg-error-100 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-error-900 mb-2">Authentication Error</h3>
        <p class="text-error-700 mb-4">{error}</p>
        <button
          on:click={() => goto('/auth')}
          class="btn variant-filled-primary"
        >
          Try Again
        </button>
      </div>
    {/if}
  </div>
</div>