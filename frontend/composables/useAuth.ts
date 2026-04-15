import { useState } from '#app'
import { useRouter } from 'vue-router'

export const useAuth = () => {
  const token = useState<string | null>('token', () => null)
  const router = useRouter()

  const setToken = (t: string) => {
    token.value = t
    if(process.client) localStorage.setItem('token', t)
  }

  const loadToken = () => {
    if(process.client) token.value = localStorage.getItem('token')
  }

  const logout = () => {
    token.value = null
    if(process.client) localStorage.removeItem('token')
    router.push('/login')
  }

  return { token, setToken, loadToken, logout }
}
