<template>
  <section class="card">
    <h2>Builder (생성)</h2>
    <p class="desc">HttpRequest를 단계적으로 구성하는 Builder 패턴</p>
    <button @click="run">{{ loading ? '실행중...' : 'exampleBuilds 실행' }}</button>
    <pre v-if="res">{{ pretty(res) }}</pre>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exampleBuilds } from '@/design-pattern/creational/builder'

const res = ref<any>(null)
const loading = ref(false)
const pretty = (v: unknown) => JSON.stringify(v, null, 2)

function run() {
  loading.value = true
  res.value = exampleBuilds()
  loading.value = false
}
</script>

<style scoped>
.card{background:#0f172a;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px}
.desc{color:#94a3b8}
button{margin:10px 0;background:#3b82f6;color:#fff;border:none;padding:8px 12px;border-radius:10px;font-weight:700;cursor:pointer}
pre{background:#0b1220;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px;white-space:pre-wrap}
</style>
