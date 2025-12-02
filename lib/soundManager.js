/**
 * Gerenciador de sons suaves para feedback de ações
 * Usa Web Audio API para criar sons sintéticos suaves
 */
class SoundManager {
  constructor() {
    this.audioContext = null
    this.isEnabled = true
    this.volume = 0.3 // Volume padrão (30%)
  }

  /**
   * Inicializa o contexto de áudio
   */
  init() {
    if (typeof window === 'undefined') return
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API não suportada')
      this.isEnabled = false
    }
  }

  /**
   * Toca um som suave de sucesso
   */
  playSuccess() {
    if (!this.isEnabled || !this.audioContext) return
    this.playTone(523.25, 0.1, 'sine') // Nota C5
  }

  /**
   * Toca um som suave de erro
   */
  playError() {
    if (!this.isEnabled || !this.audioContext) return
    this.playTone(220, 0.15, 'sine') // Nota A3
  }

  /**
   * Toca um som suave de clique
   */
  playClick() {
    if (!this.isEnabled || !this.audioContext) return
    this.playTone(440, 0.05, 'sine') // Nota A4
  }

  /**
   * Toca um som suave de confirmação
   */
  playConfirm() {
    if (!this.isEnabled || !this.audioContext) return
    // Toca duas notas em sequência
    this.playTone(523.25, 0.08, 'sine')
    setTimeout(() => {
      this.playTone(659.25, 0.1, 'sine') // Nota E5
    }, 80)
  }

  /**
   * Toca um tom específico
   */
  playTone(frequency, duration, type = 'sine') {
    if (!this.audioContext) {
      this.init()
      if (!this.audioContext) return
    }

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    // Envelope suave (fade in/out)
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  /**
   * Habilita ou desabilita os sons
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  /**
   * Define o volume (0 a 1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
}

// Instância singleton
export const soundManager = new SoundManager()

// Inicializa quando disponível
if (typeof window !== 'undefined') {
  // Inicializa após interação do usuário (requisito do navegador)
  const initOnInteraction = () => {
    soundManager.init()
    window.removeEventListener('click', initOnInteraction)
    window.removeEventListener('touchstart', initOnInteraction)
  }
  window.addEventListener('click', initOnInteraction, { once: true })
  window.addEventListener('touchstart', initOnInteraction, { once: true })
}

