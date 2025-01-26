<template>
  <div class="support-chat">
    <!-- Chat Button -->
    <button 
      class="support-chat-button"
      @click="toggleChat"
      :aria-expanded="isOpen"
      aria-label="Support Chat">
      <span class="icon">💬</span>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window" ref="chatWindow">
      <div class="resize-handle top-left" @mousedown="startResize('top-left')"></div>
      <div class="resize-handle top-right" @mousedown="startResize('top-right')"></div>
      <div class="resize-handle bottom-left" @mousedown="startResize('bottom-left')"></div>
      <div class="resize-handle bottom-right" @mousedown="startResize('bottom-right')"></div>
      <div class="chat-header">
        <h3>Support Chat</h3>
        <button @click="toggleChat" class="close-button" aria-label="Close chat">×</button>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message', message.role === 'user' ? 'user' : 'support']">
          {{ message.content }}
        </div>
        <div v-if="isLoading" class="message support">
          <span class="typing-indicator">...</span>
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          type="text"
          :disabled="isLoading"
        />
        <button 
          @click="sendMessage" 
          aria-label="Send message"
          :disabled="isLoading"
        >
          Send
        </button>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDeepSeek } from '@/composables/useDeepSeek'

const isOpen = ref(false)
const newMessage = ref('')
const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([
  { role: 'assistant', content: 'Hello! How can I help you today?' }
])
const chatWindow = ref<HTMLElement | null>(null)

const { sendMessage: sendToDeepSeek, isLoading, error } = useDeepSeek()

// Resizing functionality
const isResizing = ref(false)
const currentHandle = ref<string>('')
const initialSize = ref({ width: 0, height: 0 })
const initialPosition = ref({ x: 0, y: 0 })
const initialMousePosition = ref({ x: 0, y: 0 })

const startResize = (handle: string) => {
  if (!chatWindow.value) return
  
  isResizing.value = true
  currentHandle.value = handle
  
  const rect = chatWindow.value.getBoundingClientRect()
  initialSize.value = {
    width: rect.width,
    height: rect.height
  }
  initialPosition.value = {
    x: rect.left,
    y: rect.top
  }
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value || !chatWindow.value) return

  const deltaX = e.clientX - initialMousePosition.value.x
  const deltaY = e.clientY - initialMousePosition.value.y
  const rect = chatWindow.value.getBoundingClientRect()

  let newWidth = initialSize.value.width
  let newHeight = initialSize.value.height
  let newLeft = rect.left
  let newTop = rect.top

  switch (currentHandle.value) {
    case 'top-left':
      newWidth = initialSize.value.width - deltaX
      newHeight = initialSize.value.height - deltaY
      newLeft = initialPosition.value.x + deltaX
      newTop = initialPosition.value.y + deltaY
      break
    case 'top-right':
      newWidth = initialSize.value.width + deltaX
      newHeight = initialSize.value.height - deltaY
      newTop = initialPosition.value.y + deltaY
      break
    case 'bottom-left':
      newWidth = initialSize.value.width - deltaX
      newHeight = initialSize.value.height + deltaY
      newLeft = initialPosition.value.x + deltaX
      break
    case 'bottom-right':
      newWidth = initialSize.value.width + deltaX
      newHeight = initialSize.value.height + deltaY
      break
  }

  // Apply minimum size constraints
  const minWidth = 300
  const minHeight = 400
  newWidth = Math.max(newWidth, minWidth)
  newHeight = Math.max(newHeight, minHeight)

  chatWindow.value.style.width = `${newWidth}px`
  chatWindow.value.style.height = `${newHeight}px`
  chatWindow.value.style.left = `${newLeft}px`
  chatWindow.value.style.top = `${newTop}px`
}

const stopResize = () => {
  isResizing.value = false
}

const handleMouseDown = (e: MouseEvent) => {
  initialMousePosition.value = {
    x: e.clientX,
    y: e.clientY
  }
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const cleanup = () => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

onMounted(() => {
  document.addEventListener('mousedown', handleMouseDown)
})

onUnmounted(() => {
  cleanup()
  document.removeEventListener('mousedown', handleMouseDown)
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (newMessage.value.trim() && !isLoading.value) {
    const userMessage = newMessage.value
    messages.value.push({ role: 'user', content: userMessage })
    newMessage.value = ''

    try {
      const response = await sendToDeepSeek(messages.value)
      messages.value.push({ role: 'assistant', content: response })
    } catch (e) {
      // Error is already handled by the composable
      console.error('Failed to get response:', e)
    }
  }
}
</script>

<style scoped>
.support-chat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.support-chat-button {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-chat-button:hover {
  transform: scale(1.1);
}

.icon {
  font-size: 24px;
}

.chat-window {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  resize: both;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: transparent;
  z-index: 1000;
}

.resize-handle.top-left {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.resize-handle.top-right {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.resize-handle.bottom-left {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}

.resize-handle.bottom-right {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

.resize-handle:hover {
  background: rgba(0, 0, 0, 0.1);
}

.chat-window * {
  user-select: none;
}

.chat-header {
  padding: 15px;
  background: #4CAF50;
  color: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0 5px;
}

.chat-messages {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 80%;
  word-break: break-word;
}

.message.user {
  background: #E3F2FD;
  align-self: flex-end;
}

.message.support {
  background: #F5F5F5;
  align-self: flex-start;
}

.chat-input {
  padding: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #eee;
}

.chat-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.chat-input input:disabled,
.chat-input button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.chat-input button {
  padding: 8px 15px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover:not(:disabled) {
  background: #45a049;
}

.error-message {
  color: #dc3545;
  padding: 8px 15px;
  font-size: 0.875rem;
  text-align: center;
  background: #fff;
  border-top: 1px solid #eee;
}

.typing-indicator {
  display: inline-block;
  animation: typing 1.5s infinite;
}

@keyframes typing {
  0%, 20% { content: "."; }
  40% { content: ".."; }
  60%, 100% { content: "..."; }
}
</style>
