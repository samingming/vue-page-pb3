// src/types/vue-router.d.ts
// vue-router v4 타입을 확실히 참조하도록 dist 위치로 연결
declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router'
  const _default: typeof import('vue-router/dist/vue-router')['default']
  export default _default
}
