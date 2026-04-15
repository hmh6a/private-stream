<template>
  <div class="card" style="max-width: 400px; margin: 100px auto;">
    <h2>Admin Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <p style="color:red" v-if="error">{{ error }}</p>
      <button type="submit" style="width:100%">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const config = useRuntimeConfig()
const { setToken } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

definePageMeta({ middleware: 'auth' })

async function handleLogin() {
  error.value = ''
  try {
    const res = await $fetch(`${config.public.apiUrl}/auth/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    setToken(res.access_token)
    router.push('/admin')
  } catch(e) {
    error.value = 'Invalid credentials'
  }
}
</script>
