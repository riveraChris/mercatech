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

