<template>
  <div>
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Source Management</h3>
      <div style="display:flex; gap: 1rem; align-items:center; margin-bottom:1rem;">
        <span class="badge" :class="status.status">{{ status.status }}</span>
        <span v-if="status.lastError" style="color: var(--danger); font-size: 0.9rem;">{{ status.lastError }}</span>
      </div>
      <form @submit.prevent="saveSource">
        <label>Stream Source URL (Authorized only):</label>
        <input type="url" v-model="sourceUrl" placeholder="http://example.com/stream.m3u8" required />
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="submit">Save & Restart Relay</button>
          <button type="button" class="secondary" @click="action('start')" :disabled="status.status === 'running'">Start</button>
          <button type="button" class="danger" @click="action('stop')" :disabled="status.status === 'stopped' || status.status === 'idle'">Stop</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>Relay Logs</h3>
      <div class="logs" ref="logsContainer">
        <div v-for="(log, i) in logs" :key="i">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
definePageMeta({ layout: 'admin', middleware: 'auth' })

const config = useRuntimeConfig()
const { token, loadToken, logout } = useAuth()
const sourceUrl = ref('')
const status = ref({ status: 'idle', lastError: null })
const logs = ref([])
const logsContainer = ref(null)
let socket = null

const authHeaders = () => ({ Authorization: `Bearer ${token.value}` })

async function fetchState() {
  try {
    const s = await $fetch(`${config.public.apiUrl}/stream/status`, { headers: authHeaders() })
    status.value = s
    const cur = await $fetch(`${config.public.apiUrl}/stream/current`, { headers: authHeaders() })
    if(cur) sourceUrl.value = cur.sourceUrl
    logs.value = await $fetch(`${config.public.apiUrl}/stream/logs`, { headers: authHeaders() })
    scrollToBottom()
  } catch(e) {
    if(e.response?.status === 401) logout()
  }
}

async function saveSource() {
  await $fetch(`${config.public.apiUrl}/stream/current`, {
    method: 'PUT',
    headers: authHeaders(),
    body: { url: sourceUrl.value }
  })
}

async function action(cmd) {
  await $fetch(`${config.public.apiUrl}/stream/${cmd}`, {
    method: 'POST',
    headers: authHeaders()
  })
}

function scrollToBottom() {
  nextTick(() => {
    if(logsContainer.value) logsContainer.value.scrollTop = logsContainer.value.scrollHeight
  })
}

onMounted(() => {
  loadToken()
  fetchState()
  socket = io(config.public.wsUrl)
  socket.on('relayState', (s) => { status.value = s })
  socket.on('relayLog', (l) => { logs.value.push(l); scrollToBottom() })
})

onUnmounted(() => {
  if(socket) socket.disconnect()
})
</script>
