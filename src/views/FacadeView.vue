<template>
  <section class="card">
    <h2>Facade (구조)</h2>
    <p class="desc">서브시스템(Auth/Product/Cart/Payment)을 단일 API로 단순화</p>

    <div class="actions">
      <button @click="run" :disabled="loading">{{ loading ? '실행중...' : '예시 실행' }}</button>
    </div>

    <div class="result" v-if="res">
      <h3>주문 결과</h3>
      <pre>{{ pretty(res) }}</pre>
    </div>
    <p v-if="error" class="err">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exampleFacadeFlow } from '@/design-pattern/structural/facade'

const loading = ref(false)
const res = ref<any>(null)
const error = ref('')

function pretty(v: unknown) {
  return JSON.stringify(v, null, 2)
}

async function run() {
  loading.value = true
  error.value = ''
  res.value = null
  try {
    res.value = await exampleFacadeFlow()
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card{background:#0f172a;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px}
.desc{color:#94a3b8}
.actions{margin:10px 0}
button{background:#22c55e;color:#000;border:none;padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:800}
.result{margin-top:12px;background:#0b1220;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px}
pre{margin:0;white-space:pre-wrap;word-break:break-word}
.err{color:#ef4444;font-weight:700;margin-top:8px}
</style>
