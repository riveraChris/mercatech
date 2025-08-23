<!-- Landing Page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import Logo from '$lib/components/Logo.svelte';

  // Redirect authenticated users to app
  onMount(() => {
    const unsubscribe = auth.subscribe(($auth) => {
      if (!$auth.loading && $auth.user && $auth.profile) {
        goto('/app');
      }
    });

    return unsubscribe;
  });

  const features = [
    {
      icon: '📱',
      title: 'Móvil Primero',
      description: 'Diseñado específicamente para dispositivos móviles con una experiencia fluida.'
    },
    {
      icon: '🔒',
      title: 'Seguro y Confiable',
      description: 'Autenticación segura y perfiles verificados para transacciones confiables.'
    },
    {
      icon: '🏝️',
      title: 'Enfoque Local',
      description: 'Especializado en Puerto Rico con todos los 78 municipios disponibles.'
    },
    {
      icon: '⚡',
      title: 'Rápido y Fácil',
      description: 'Publica y encuentra productos en segundos con nuestra interfaz intuitiva.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Productos Activos' },
    { number: '500+', label: 'Usuarios Registrados' },
    { number: '78', label: 'Municipios Cubiertos' },
    { number: '24/7', label: 'Disponibilidad' }
  ];
</script>

<svelte:head>
  <title>MercaTech - El Marketplace de Electrónicos #1 en Puerto Rico</title>
  <meta name="description" content="Compra y vende electrónicos de forma segura en Puerto Rico. Miles de productos, precios competitivos, y transacciones confiables." />
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 min-h-screen flex items-center">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center text-white">
      <!-- Logo -->
      <div class="mb-8">
        <Logo size="xl" variant="light" />
      </div>
      
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        <span class="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          MercaTech
        </span>
      </h1>
      
      <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
        El marketplace #1 de electrónicos en Puerto Rico
      </p>
      
      <p class="text-lg mb-12 text-blue-200 max-w-2xl mx-auto">
        Compra y vende dispositivos electrónicos de forma segura. Miles de productos, precios competitivos, y transacciones confiables en toda la isla.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/auth" class="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg">
          Comenzar Ahora
        </a>
        <a href="/app" class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
          Explorar Productos
        </a>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        ¿Por qué elegir MercaTech?
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        La plataforma más confiable y fácil de usar para comprar y vender electrónicos en Puerto Rico.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each features as feature}
        <div class="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div class="text-4xl mb-4">{feature.icon}</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
          <p class="text-gray-600">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Stats Section -->
<div class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
        Números que hablan por sí solos
      </h2>
    </div>
    
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {#each stats as stat}
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
          <div class="text-blue-200 text-lg">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- How it Works Section -->
<div class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Cómo funciona
      </h2>
      <p class="text-xl text-gray-600">
        Tres pasos simples para comenzar a comprar o vender
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div class="text-center">
        <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <span class="text-2xl font-bold text-blue-600">1</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Regístrate</h3>
        <p class="text-gray-600">Crea tu cuenta de forma rápida y segura con Google.</p>
      </div>
      
      <div class="text-center">
        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <span class="text-2xl font-bold text-purple-600">2</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Explora o Publica</h3>
        <p class="text-gray-600">Busca productos increíbles o publica los tuyos en minutos.</p>
      </div>
      
      <div class="text-center">
        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <span class="text-2xl font-bold text-green-600">3</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Conecta y Compra</h3>
        <p class="text-gray-600">Contacta directamente con vendedores y realiza transacciones seguras.</p>
      </div>
    </div>
  </div>
</div>

<!-- Roadmap Section -->
<div class="py-20 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Próximas Funcionalidades
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Estamos constantemente mejorando MercaTech. Estas son algunas de las funciones que vienen pronto.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Chat en Tiempo Real</h3>
        <p class="text-gray-600 text-sm">Mensajería instantánea entre compradores y vendedores para negociaciones más rápidas.</p>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Q1 2025
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="bg-green-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Verificación de Vendedores</h3>
        <p class="text-gray-600 text-sm">Sistema de verificación de identidad para mayor confianza en las transacciones.</p>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Q2 2025
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="bg-purple-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Pagos Integrados</h3>
        <p class="text-gray-600 text-sm">Procesamiento de pagos seguro directamente en la plataforma con ATH Móvil y tarjetas.</p>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Q2 2025
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="bg-yellow-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Sistema de Reseñas</h3>
        <p class="text-gray-600 text-sm">Calificaciones y comentarios de compradores para construir reputación de vendedores.</p>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Q3 2025
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="bg-red-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l6.586 6.586a2 2 0 002.828 0L20.828 7M9 3h6v4H9V3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Entrega a Domicilio</h3>
        <p class="text-gray-600 text-sm">Servicio de entrega coordinado con mensajeros locales para mayor comodidad.</p>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Q3 2025
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">App Móvil Nativa</h3>
        <p class="text-gray-600 text-sm">Aplicación móvil dedicada para iOS y Android con notificaciones push.</p>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Q4 2025
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
      ¿Listo para comenzar?
    </h2>
    <p class="text-xl text-blue-200 mb-8">
      Únete a miles de puertorriqueños que ya confían en MercaTech para sus compras y ventas de electrónicos.
    </p>
    <a href="/auth" class="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg inline-block">
      Crear Cuenta Gratis
    </a>
  </div>
</div>

