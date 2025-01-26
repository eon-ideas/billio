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
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <h3>Support Chat</h3>
        <button @click="toggleChat" class="close-button" aria-label="Close chat">×</button>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message', message.type]">
          {{ message.text }}
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          type="text"
        />
        <button @click="sendMessage" aria-label="Send message">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const newMessage = ref('')
const messages = ref([
  { text: 'Hello! How can we help you today?', type: 'support' }
])

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({ text: newMessage.value, type: 'user' })
    newMessage.value = ''
    // Here you would typically integrate with your actual support chat service
    setTimeout(() => {
      messages.value.push({ 
        text: 'Thank you for your message. Our support team will get back to you soon.',
        type: 'support'
      })
    }, 1000)
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

.chat-input button {
  padding: 8px 15px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #45a049;
}
</style>
