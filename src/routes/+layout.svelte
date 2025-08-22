<script lang="ts">
	import '../app.css';
	import { auth, authService } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import Logo from '$lib/components/Logo.svelte';

	let { children } = $props();
	let dropdownOpen = $state(false);

	// Check if current route requires authentication
	const requiresAuth = $derived(!$page.url.pathname.startsWith('/auth') && $page.url.pathname !== '/');
	const isAuthPage = $derived($page.url.pathname.startsWith('/auth'));

	function handleSignOut() {
		authService.signOut();
		dropdownOpen = false;
	}

	function navigateToProfile() {
		goto('/profile');
		dropdownOpen = false;
	}

	function navigateToMyListings() {
		goto('/my');
		dropdownOpen = false;
	}

	function navigateToFavorites() {
		goto('/favorites');
		dropdownOpen = false;
	}

	function navigateToPost() {
		goto('/post');
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.profile-dropdown')) {
			dropdownOpen = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<!-- Skip auth pages and show content directly -->
{#if isAuthPage}
	{@render children?.()}
{:else}
	<!-- Main App Layout -->
	<div class="min-h-screen bg-surface-50">
		<!-- Top Navigation -->
		<nav class="bg-white shadow-sm border-b border-surface-200 sticky top-0 z-50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<!-- Logo -->
					<a href="/app" class="flex items-center">
						<Logo size="sm" variant="color" />
					</a>

					<!-- User Menu -->
					{#if $auth.user && $auth.profile}
						<div class="flex items-center space-x-4">
							<!-- Post Button -->
							<button
								onclick={navigateToPost}
								class="btn variant-filled-primary btn-sm"
							>
								<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								Publicar
							</button>

							<!-- Profile Dropdown -->
							<div class="relative profile-dropdown">
								<button
									class="flex items-center space-x-2 text-surface-700 hover:text-surface-900"
									onclick={toggleDropdown}
								>
									{#if $auth.profile.avatar_url}
										<img 
											src={$auth.profile.avatar_url} 
											alt="Profile" 
											class="h-8 w-8 rounded-full object-cover border border-primary-200"
										/>
									{:else}
										<div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
											<span class="text-sm font-medium text-primary-700">
												{$auth.profile.display_name.charAt(0).toUpperCase()}
											</span>
										</div>
									{/if}
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>

								<!-- Dropdown Menu -->
								{#if dropdownOpen}
									<div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-surface-200 py-1 z-10">
										<button
											onclick={navigateToMyListings}
											class="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center"
										>
											<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
											</svg>
											Mis Publicaciones
										</button>
										<button
											onclick={navigateToFavorites}
											class="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center"
										>
											<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
											</svg>
											Mis Favoritos
										</button>
										<button
											onclick={navigateToProfile}
											class="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center"
										>
											<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
											Mi Perfil
										</button>
										<hr class="my-1 border-surface-200" />
										<button
											onclick={handleSignOut}
											class="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 flex items-center"
										>
											<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
											</svg>
											Cerrar Sesión
										</button>
									</div>
								{/if}
							</div>
						</div>
					{:else if !$auth.loading}
						<!-- Sign In Button -->
						<a href="/auth" class="btn variant-filled-primary btn-sm">
							Iniciar Sesión
						</a>
					{/if}
				</div>
			</div>
		</nav>

		<!-- Main Content -->
		<main class="flex-1" onclick={handleClickOutside}>
			{@render children?.()}
		</main>

		<!-- Bottom Navigation (Mobile) -->
		{#if $auth.user && $auth.profile}
			<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 md:hidden">
				<div class="flex justify-around py-2">
					<a
						href="/"
						class="flex flex-col items-center py-2 px-3 text-xs {$page.url.pathname === '/' ? 'text-primary-600' : 'text-surface-500'}"
					>
						<svg class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
						</svg>
						Inicio
					</a>
					<a
						href="/post"
						class="flex flex-col items-center py-2 px-3 text-xs {$page.url.pathname === '/post' ? 'text-primary-600' : 'text-surface-500'}"
					>
						<svg class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Publicar
					</a>
					<a
						href="/favorites"
						class="flex flex-col items-center py-2 px-3 text-xs {$page.url.pathname === '/favorites' ? 'text-primary-600' : 'text-surface-500'}"
					>
						<svg class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						Favoritos
					</a>
					<a
						href="/my"
						class="flex flex-col items-center py-2 px-3 text-xs {$page.url.pathname === '/my' ? 'text-primary-600' : 'text-surface-500'}"
					>
						<svg class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
						Mis Anuncios
					</a>
					<a
						href="/profile"
						class="flex flex-col items-center py-2 px-3 text-xs {$page.url.pathname === '/profile' ? 'text-primary-600' : 'text-surface-500'}"
					>
						<svg class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Perfil
					</a>
				</div>
			</nav>
		{/if}
	</div>
{/if}
