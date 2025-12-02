/**
 * Sistema de sons suaves para a aplicação
 * Utiliza Web Audio API para criar sons não intrusivos
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
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  /**
   * Ativa ou desativa os sons
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

  /**
   * Toca um som suave de confirmação
   */
  playSuccess() {
    if (!this.isEnabled || !this.audioContext) return
    this.init()

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Som ascendente suave
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  /**
   * Toca um som suave de erro/cancelamento
   */
  playError() {
    if (!this.isEnabled || !this.audioContext) return
    this.init()

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Som descendente suave
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  /**
   * Toca um som suave de clique
   */
  playClick() {
    if (!this.isEnabled || !this.audioContext) return
    this.init()

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Som curto e suave
    oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.05)
  }

  /**
   * Toca um som suave de notificação
   */
  playNotification() {
    if (!this.isEnabled || !this.audioContext) return
    this.init()

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Som de notificação suave
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.15)
  }
}

// Exporta instância singleton
export const soundManager = new SoundManager()

