<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let variant: 'light' | 'dark' | 'color' = 'color';
  
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };
</script>

<div class="flex items-center gap-3">
  <!-- Logo Icon -->
  <div class="relative {sizes[size]} rounded-xl flex items-center justify-center {variant === 'light' ? 'bg-white/20 backdrop-blur-sm' : variant === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-500 to-purple-600'} shadow-lg">
    <!-- Circuit pattern background -->
    <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 40 40" fill="none">
      <path d="M8 8h6v6H8V8zM26 8h6v6h-6V8zM8 26h6v6H8v-6zM26 26h6v6h-6v-6z" fill="currentColor"/>
      <path d="M14 11h12M11 14v12M29 14v12M14 29h12" stroke="currentColor" stroke-width="1"/>
    </svg>
    
    <!-- Main icon -->
    <svg class="relative z-10 {size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-10 w-10'} {variant === 'light' ? 'text-white' : variant === 'dark' ? 'text-white' : 'text-white'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6v6H9V9z" />
    </svg>
  </div>
  
  <!-- Brand Text -->
  <div class="flex flex-col">
    <span class="font-bold {textSizes[size]} {variant === 'light' ? 'text-white' : variant === 'dark' ? 'text-gray-900' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'} leading-none">
      MercaTech
    </span>
    {#if size === 'lg' || size === 'xl'}
      <span class="text-xs {variant === 'light' ? 'text-blue-200' : variant === 'dark' ? 'text-gray-500' : 'text-gray-600'} font-medium">
        Electrónicos PR
      </span>
    {/if}
  </div>
</div>
