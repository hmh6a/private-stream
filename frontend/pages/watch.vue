<template>
  <div style="background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; margin: -2rem;">
    <div style="position: absolute; top: 2rem; left: 2rem; z-index: 10;">
      <h2 style="color: #fff; margin:0; font-family: sans-serif;">Live Feed</h2>
      <div v-if="status.status" class="badge" :class="status.status" style="display:inline-block; margin-top:5px;">{{ status.status }}</div>
    </div>
    
    <div v-if="status.status !== 'running'" style="color: #888; text-align:center;">
       <h3>Stream is currently offline</h3>
       <p>{{ status.lastError || 'Waiting for signal...' }}</p>
    </div>
    
    <video
      v-show="status.status === 'running'"
      ref="videoPlayer"
      controls
      autoplay
      style="width: 100%; height: 100%; object-fit: contain; background: #000;"
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Hls from 'hls.js'
import { io } from 'socket.io-client'
definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const videoPlayer = ref(null)
const status = ref({ status: 'idle' })
let hls = null
let socket = null

function initPlayer() {
  if (!videoPlayer.value) return
  const src = '/hls/index.m3u8'

  if (Hls.isSupported()) {
    if(hls) hls.destroy()
    hls = new Hls()
    hls.loadSource(src)
    hls.attachMedia(videoPlayer.value)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoPlayer.value.play().catch(()=>console.log('Autoplay blocked'))
    })
  } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoPlayer.value.src = src
    videoPlayer.value.addEventListener('loadedmetadata', () => {
      videoPlayer.value.play().catch(()=>console.log('Autoplay blocked'))
    })
  }
}

onMounted(async () => {
  try {
    status.value = await $fetch(`${config.public.apiUrl}/stream/status`)
  } catch(e) {}
  
  if(status.value.status === 'running') initPlayer()

  socket = io(config.public.wsUrl)
  socket.on('relayState', (s) => {
     const wasRunning = status.value.status === 'running'
     status.value = s
     if (!wasRunning && s.status === 'running') {
        setTimeout(initPlayer, 2000) 
     }
  })
})

onUnmounted(() => {
  if(hls) hls.destroy()
  if(socket) socket.disconnect()
})
</script>
