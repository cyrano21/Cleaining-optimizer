<template>
  <div id="app">
    <header>
      <h1>Vue.js Starter</h1>
      <p>Welcome to your Vue.js application!</p>
    </header>
    
    <main>
      <div class="card">
        <h2>Getting Started</h2>
        <p>Edit <code>src/App.vue</code> to get started.</p>
        <button @click="count++" class="btn">
          Count is: {{ count }}
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const count = ref(0)
    
    return {
      count
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.card {
  padding: 2rem;
  margin: 2rem auto;
  max-width: 600px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background-color: #369870;
}

code {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>