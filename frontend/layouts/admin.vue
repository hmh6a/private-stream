<template>
  <div class="container">
    <div class="header">
      <h2>Relay Admin</h2>
      <nav>
        <NuxtLink to="/watch" target="_blank">Watch Live</NuxtLink>
        <a href="#" @click.prevent="logout">Logout</a>
      </nav>
    </div>
    <slot />
    <div class="restriction-notice">
      Notice: This system is intended for authorized / user-owned / licensed stream sources only.
    </div>
  </div>
</template>
<script setup>
const { logout } = useAuth()
</script>
