<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Top Bar -->
    <header class="topbar">
      <div class="brand">
        <img src="./assets/logo.png" alt="logo" />
        <h1>Design Patterns Showcase</h1>
      </div>
      <nav class="tabs">
        <button :class="{active: tab==='strategy'}" @click="tab='strategy'">Strategy</button>
        <button :class="{active: tab==='builder'}"  @click="tab='builder'">Builder</button>
        <button :class="{active: tab==='facade'}"   @click="tab='facade'">Facade</button>
      </nav>
    </header>

    <main class="container">
      <!-- ==========================
           STRATEGY (행위) : CART
      =========================== -->
      <section v-show="tab==='strategy'" class="panel">
        <header class="panel-head">
          <h2>🧩 Strategy · 장바구니 할인 전략</h2>
          <div class="policy">
            <label><input type="radio" value="sum" v-model="policy" /> 합산(sum)</label>
            <label><input type="radio" value="max" v-model="policy" /> 최대(max)</label>
          </div>
        </header>

        <div class="grid-3">
          <!-- Cart -->
          <div class="card">
            <div class="card-head">
              <h3>🛒 내 장바구니</h3>
              <button class="ghost" @click="resetCart">초기화</button>
            </div>
            <table class="table">
              <thead>
                <tr><th>상품</th><th class="num">단가</th><th class="qty">수량</th><th class="num">소계</th></tr>
              </thead>
              <tbody>
                <tr v-for="it in items" :key="it.id">
                  <td>
                    <div class="prod">
                      <span class="title">{{ it.title }}</span>
                      <small class="cat">#{{ it.category }}</small>
                    </div>
                  </td>
                  <td class="num">{{ money(it.price) }}</td>
                  <td class="qty">
                    <button @click="dec(it)">−</button>
                    <input type="number" min="0" :value="it.qty" @input="setQty(it, $event)" />
                    <button @click="inc(it)">＋</button>
                  </td>
                  <td class="num">{{ money(it.price * it.qty) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="right">소계(Subtotal)</td>
                  <td class="num strong">{{ money(subtotal) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Strategies -->
          <div class="card">
            <div class="card-head"><h3>⚙️ 할인 전략</h3></div>
            <div class="vstack">
              <label class="switch">
                <input type="checkbox" v-model="enabled.all5" />
                <span>전체 5% 할인</span>
              </label>
              <label class="switch">
                <input type="checkbox" v-model="enabled.book10" />
                <span>도서 10%</span>
              </label>
              <label class="switch">
                <input type="checkbox" v-model="enabled.vip7000" />
                <span>VIP 전용 7,000원</span>
              </label>
              <div class="coupon-row">
                <label class="switch">
                  <input type="checkbox" v-model="enabled.coupon" />
                  <span>쿠폰</span>
                </label>
                <input class="coupon" placeholder="예: WELCOME10" v-model="couponInput" @keydown.enter.prevent="applyCoupon" />
                <button class="ghost" @click="applyCoupon">적용</button>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="enabled.season" />
                <span>시즌 15% (11/20~11/30)</span>
              </label>
              <div class="chips" v-if="user.coupons?.length">
                <span class="chip" v-for="c in user.coupons" :key="c">{{ c }}</span>
                <button class="ghost small" @click="clearCoupons">쿠폰 초기화</button>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="card">
            <h3>📋 결제 요약</h3>
            <ul class="discounts" v-if="result.discounts.length">
              <li v-for="d in result.discounts" :key="d.name">
                <span>{{ d.name }}</span>
                <span class="minus">- {{ money(d.amount) }}</span>
              </li>
            </ul>
            <p class="muted" v-else>적용된 할인 없음</p>
            <div class="totals">
              <div class="row"><span>소계</span><span>{{ money(result.subtotal) }}</span></div>
              <div class="row"><span>총 할인</span><span class="minus">- {{ money(result.totalDiscount) }}</span></div>
              <div class="row final"><span>결제 금액</span><span class="strong">{{ money(result.final) }}</span></div>
            </div>
            <button class="pay" :disabled="result.final === 0">결제하기</button>
            <p class="policy-note">정책: <b>{{ result.policy }}</b></p>
          </div>
        </div>
      </section>

      <!-- ==========================
           BUILDER (생성) : HTTP 레시피
           >>> 이 섹션을 개선된 폼으로 교체 <<<
      =========================== -->
      <section v-show="tab==='builder'" class="panel">
        <header class="panel-head">
          <h2>🧱 Builder · HTTP Request 레시피</h2>
          <p class="sub">ApiDirector + HttpRequestBuilder 로 GET/POST 요청 틀을 '조립'하여 생성</p>
        </header>

        <div class="grid-2">
          <!-- JSON POST 레시피 -->
          <form class="form-card" @submit.prevent="buildPost">
            <div class="form-title">
              <span class="emoji">📮</span>
              <h3>JSON POST 레시피</h3>
            </div>

            <div class="row">
              <label>URL</label>
              <input v-model="postUrl" placeholder="/api/users" />
            </div>

            <div class="row">
              <label>Payload (JSON)</label>
              <textarea
                v-model="postBody"
                rows="6"
                class="mono"
                placeholder='{"name":"saim","role":"student"}'
                @input="autoGrow($event)"
              />
              <small class="hint" v-if="postError">⚠ {{ postError }}</small>
            </div>

            <div class="row pair">
              <div>
                <label>Timeout (ms)</label>
                <input type="number" v-model.number="postTimeout" min="0" />
              </div>
              <div class="actions end">
                <button type="submit">빌드</button>
              </div>
            </div>

            <!-- 요약 카드 -->
            <div v-if="builtPost" class="summary">
              <h4>생성된 요청</h4>
              <ul>
                <li><b>Method</b> : {{ builtPost.method }}</li>
                <li><b>URL</b> : {{ builtPost.url }}</li>
                <li><b>Timeout</b> : {{ builtPost.timeoutMs }} ms</li>
                <li><b>Headers</b> :
                  <span v-if="Object.keys(builtPost.headers||{}).length===0" class="muted">없음</span>
                  <ul v-else class="inline">
                    <li v-for="(v,k) in builtPost.headers" :key="k">{{ k }}: {{ v }}</li>
                  </ul>
                </li>
                <li><b>Body</b> :
                  <span v-if="!builtPost.body" class="muted">없음</span>
                  <span v-else>{{ asText(builtPost.body) }}</span>
                </li>
              </ul>
            </div>
          </form>

          <!-- Authorized GET 레시피 -->
          <form class="form-card" @submit.prevent="buildGet">
            <div class="form-title">
              <span class="emoji">🔐</span>
              <h3>Authorized GET 레시피</h3>
            </div>

            <div class="row pair">
              <div>
                <label>URL</label>
                <input v-model="getUrl" placeholder="/api/users" />
              </div>
              <div>
                <label>Token</label>
                <input v-model="getToken" placeholder="demo-token-123" />
              </div>
            </div>

            <div class="row">
              <label>Query 추가</label>
              <div class="kv">
                <input v-model="qk" placeholder="page" />
                <input v-model="qv" placeholder="1" />
                <button class="ghost" type="button" @click="addQuery">추가</button>
              </div>
              <div class="chips" v-if="Object.keys(getQuery).length">
                <span class="chip" v-for="(v,k) in getQuery" :key="k">{{ k }}={{ v }}</span>
                <button class="ghost small" type="button" @click="clearQuery">비우기</button>
              </div>
            </div>

            <div class="actions end">
              <button type="submit">빌드</button>
            </div>

            <!-- 요약 카드 -->
            <div v-if="builtGet" class="summary">
              <h4>생성된 요청</h4>
              <ul>
                <li><b>Method</b> : {{ builtGet.method }}</li>
                <li><b>URL</b> : {{ builtGet.url }}</li>
                <li><b>Timeout</b> : {{ builtGet.timeoutMs }} ms</li>
                <li><b>Headers</b> :
                  <span v-if="Object.keys(builtGet.headers||{}).length===0" class="muted">없음</span>
                  <ul v-else class="inline">
                    <li v-for="(v,k) in builtGet.headers" :key="k">{{ k }}: {{ v }}</li>
                  </ul>
                </li>
                <li><b>Query</b> :
                  <span v-if="Object.keys(builtGet.query||{}).length===0" class="muted">없음</span>
                  <ul v-else class="inline">
                    <li v-for="(v,k) in builtGet.query" :key="k">{{ k }}={{ v }}</li>
                  </ul>
                </li>
              </ul>
            </div>
          </form>
        </div>
      </section>

      <!-- ==========================
           FACADE (구조) : 주문/결제
      =========================== -->
      <section v-show="tab==='facade'" class="panel">
        <header class="panel-head">
          <h2>🎛️ Facade · 주문 → 결제 플로우</h2>
          <p class="sub">Auth / Product / Cart / Payment 서브시스템을 ShopFacade로 단순화</p>
        </header>

        <div class="card flow">
          <ol class="steps">
            <li :class="{done: flowStep>=1}">로그인</li>
            <li :class="{done: flowStep>=2}">상품 조회 & 장바구니</li>
            <li :class="{done: flowStep>=3}">결제 시도</li>
            <li :class="{done: flowStep>=4}">영수증</li>
          </ol>

          <div class="actions-row">
            <button :disabled="facadeLoading" @click="runFacade">빠른 데모 실행</button>
            <span v-if="facadeLoading" class="muted">실행 중...</span>
          </div>

          <!-- 영수증 카드 -->
          <div v-if="facadeRes" class="receipt">
            <div class="r-head">
              <h3>✅ 주문 완료</h3>
              <span class="badge ok" v-if="facadeRes.ok">PAID</span>
              <span class="badge fail" v-else>FAILED</span>
            </div>
            <p class="muted">주문 ID: <b>{{ facadeRes.data.id }}</b></p>

            <div class="r-items">
              <h4>📦 상품</h4>
              <table class="r-table">
                <thead><tr><th>상품ID</th><th class="num">수량</th><th class="num">가격</th></tr></thead>
                <tbody>
                  <tr v-for="it in facadeRes.data.items" :key="it.productId">
                    <td>{{ it.productId }}</td>
                    <td class="num">{{ it.qty }}</td>
                    <td class="num">{{ money(it.price) }}</td>
                  </tr>
                </tbody>
                <tfoot><tr><td colspan="2" class="right">총액</td><td class="num strong">{{ money(facadeRes.data.total) }}</td></tr></tfoot>
              </table>
            </div>
          </div>

          <p class="err" v-if="facadeErr">{{ facadeErr }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

/* ===== Strategy ===== */
import {
  PriceCalculator, PercentageOffStrategy, CategoryPercentageOffStrategy,
  VipOnlyStrategy, CouponStrategy, SeasonalStrategy,
  type LineItem, type UserProfile, type CombinePolicy
} from '@/design-pattern/behavioral/strategy'

const items = reactive<LineItem[]>([
  { id: 'p1', title: 'Vue 마스터북', price: 25000, qty: 1, category: 'book' },
  { id: 'p2', title: '후드티',     price: 40000, qty: 1, category: 'fashion' },
  { id: 'p3', title: '디지털 강의', price:120000, qty: 1, category: 'digital' }
])
const user = reactive<UserProfile>({ id:'u1', name:'saim', level:'vip', coupons:['WELCOME10'] })
const enabled = reactive({ all5:true, book10:true, vip7000:true, coupon:true, season:true })
const couponInput = ref('')
const policy = ref<CombinePolicy>('sum')
const seasonStart = new Date('2025-11-20T00:00:00Z')
const seasonEnd   = new Date('2025-11-30T23:59:59Z')
const nowForSeason = new Date('2025-11-25T09:00:00Z')
const subtotal = computed(() => items.reduce((s, it) => s + it.price * it.qty, 0))
const result = computed(() => {
  const calc = new PriceCalculator().setPolicy(policy.value)
  if (enabled.all5)   calc.addStrategy(new PercentageOffStrategy('전체 5%', 5))
  if (enabled.book10) calc.addStrategy(new CategoryPercentageOffStrategy('도서 10%', 'book', 10))
  if (enabled.vip7000) calc.addStrategy(new VipOnlyStrategy('VIP 7,000', 7000))
  if (enabled.coupon)  calc.addStrategy(new CouponStrategy('쿠폰', { WELCOME10: 10000 }))
  if (enabled.season)  calc.addStrategy(new SeasonalStrategy('시즌 15%', seasonStart, seasonEnd, 15))
  return calc.compute({ items, user, now: nowForSeason })
})
function money(n:number){ return n.toLocaleString()+'원' }
function inc(it:LineItem){ it.qty++ }
function dec(it:LineItem){ it.qty = Math.max(0, it.qty-1) }
function setQty(it:LineItem, e:Event){ const v=Number((e.target as HTMLInputElement).value); it.qty = isNaN(v)?0:Math.max(0,Math.floor(v)) }
function resetCart(){ items[0].qty=1; items[1].qty=1; items[2].qty=1 }
function applyCoupon(){ const code=couponInput.value.trim().toUpperCase(); if(!code) return; if(!user.coupons) user.coupons=[]; if(!user.coupons.includes(code)) user.coupons.push(code); couponInput.value='' }
function clearCoupons(){ user.coupons=[] }

/* ===== Builder ===== */
import { HttpRequestBuilder, ApiDirector } from '@/design-pattern/creational/builder'
const postUrl = ref('/api/users')
const postBody = ref('{"name":"saim","role":"student"}')
const postTimeout = ref(8000)
const builtPost = ref<any>(null)
const getUrl = ref('/api/users')
const getToken = ref('demo-token-123')
const getQuery = reactive<Record<string,string|number|boolean>>({})
const qk = ref('page')
const qv = ref('1')
const builtGet = ref<any>(null)

/* 추가: JSON 파싱 안내 & textarea 자동 높이 */
const postError = ref('')
function autoGrow(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function buildPost(){
  try{
    postError.value = ''
    const director = new ApiDirector(new HttpRequestBuilder())
    const payload = safeJSON(postBody.value)
    if (typeof payload === 'string') {
      postError.value = '유효한 JSON 형식이 아닙니다. 그대로 문자열로 전송됩니다.'
    }
    builtPost.value = director.makeJsonPost(postUrl.value, payload, postTimeout.value)
  }catch(e:any){ builtPost.value = { error: e?.message ?? String(e) } }
}
function addQuery(){
  const key = qk.value.trim()
  const raw = qv.value.trim()
  if(!key) return
  const val = raw === '' ? '' : (isNaN(Number(raw)) ? raw : Number(raw))
  getQuery[key] = val as any
  qk.value = ''; qv.value = ''
}
function clearQuery(){ for(const k of Object.keys(getQuery)) delete getQuery[k] }
function buildGet(){
  try{
    const director = new ApiDirector(new HttpRequestBuilder())
    builtGet.value = director.makeAuthorizedGet(getUrl.value, getToken.value, getQuery, 5000)
  }catch(e:any){ builtGet.value = { error: e?.message ?? String(e) } }
}
function safeJSON(txt:string){ try{ return JSON.parse(txt) }catch{ return txt } }
function asText(v:any){ return typeof v==='string' ? v : JSON.stringify(v) }

/* ===== Facade ===== */
import { exampleFacadeFlow } from '@/design-pattern/structural/facade'
const facadeRes = ref<any>(null)
const facadeErr = ref('')
const facadeLoading = ref(false)
const flowStep = ref(0)
async function runFacade(){
  facadeLoading.value = true
  facadeErr.value = ''
  facadeRes.value = null
  flowStep.value = 0
  try{
    flowStep.value = 1; await delay()
    flowStep.value = 2; await delay()
    flowStep.value = 3;
    facadeRes.value = await exampleFacadeFlow()
    flowStep.value = 4
  }catch(e:any){ facadeErr.value = e?.message ?? String(e) }
  finally{ facadeLoading.value = false }
}
function delay(){ return new Promise(res=>setTimeout(res, 350)) }

/* ===== UI shared ===== */
const tab = ref<'strategy'|'builder'|'facade'>('strategy')
</script>

<style>
:root{
  --bg:#f5f6fa;
  --panel:#ffffff;
  --panel2:#fafafa;
  --text:#1e293b;
  --muted:#64748b;
  --line:#dcdfe6;
  --accent:#4f46e5;
  --accent2:#22c55e;
  --danger:#ef4444;
}

*{box-sizing:border-box}
#app{
  min-height:100vh;
  background:#f5f6fa;
  color:var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Apple SD Gothic Neo, Malgun Gothic, "맑은 고딕", Arial;
}

/* topbar */
.topbar{
  display:flex;justify-content:space-between;align-items:center;
  padding:14px 20px;
  background:#ffffff;
  border-bottom:1px solid var(--line);
  position:sticky;top:0;z-index:10;
}
.brand{display:flex;align-items:center;gap:12px}
.brand img{width:28px;height:28px}
.brand h1{margin:0;font-size:18px;color:#334155}
.tabs{display:flex;gap:8px}
.tabs button{
  background:#e2e8f0;
  border:1px solid var(--line);
  color:#334155;
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
  font-weight:600;
}
.tabs button.active{
  background:var(--accent);
  border-color:var(--accent);
  color:white;
}

/* layout */
.container{max-width:1200px;margin:0 auto;padding:20px}
.panel{display:block}
.panel-head{margin-bottom:12px}
.panel-head h2{margin:0;color:#334155}
.panel-head .sub{margin:6px 0 0;color:var(--muted)}
.policy{display:flex;gap:12px;color:#334155}

/* 카드 */
.card{
  background:var(--panel);
  border:1px solid var(--line);
  border-radius:14px;
  box-shadow:0 4px 14px rgba(0,0,0,.06);
  padding:16px;
}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}

/* grid layouts */
.grid-3{display:grid;grid-template-columns:1.2fr .9fr .9fr;gap:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width:1100px){.grid-3,.grid-2{grid-template-columns:1fr}}

/* table/cart */
.table{
  width:100%;
  border-collapse:collapse;
  font-size:14px;
  border-top:1px solid var(--line);
  border-bottom:1px solid var(--line);
}
.table th{
  text-align:left;
  padding:10px 8px;
  background:#f1f5f9;
  color:var(--muted);
  font-weight:600;
}
.table td{
  padding:10px 8px;
  border-bottom:1px solid var(--line);
}
.table .num{text-align:right;white-space:nowrap}
.table .qty{display:flex;align-items:center;gap:6px}
.table input{
  width:64px;padding:6px 8px;
  background:#ffffff;color:var(--text);
  border:1px solid var(--line);border-radius:8px;
}
.prod .title{font-weight:700;color:#334155}
.prod .cat{color:var(--muted)}

/* switches / controls */
button{
  background:var(--accent);
  color:white;
  border:none;
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
  font-weight:600;
}
button.ghost{
  background:#ffffff;
  border:1px solid var(--line);
  color:#334155;
}
button.ghost.small{padding:6px 10px;font-size:12px}
button:disabled{opacity:.5;cursor:not-allowed}

/* switch, rows */
.switch{
  display:flex;align-items:center;gap:10px;
  padding:10px 12px;
  background:white;
  border:1px solid var(--line);
  border-radius:10px;
}
.vstack{display:grid;gap:10px}
.coupon-row{
  display:grid;grid-template-columns:auto 1fr auto;
  gap:10px;align-items:center;
}
.coupon{
  width:100%;padding:8px 10px;
  background:white;color:var(--text);
  border:1px solid var(--line);border-radius:8px;
}

/* discounts & totals */
.discounts{
  list-style:none;padding:0;margin:0 0 12px;
  border:1px solid var(--line);border-radius:10px;overflow:hidden;
}
.discounts li{
  display:flex;justify-content:space-between;
  padding:8px 10px;border-bottom:1px solid var(--line)
}
.discounts li:last-child{border-bottom:none}
.minus{color:#16a34a}
.muted{color:var(--muted)}
.totals{border-top:1px dashed var(--line);padding-top:10px}
.totals .row{
  display:flex;justify-content:space-between;
  padding:8px 0;color:#334155;
}
.totals .row.final{
  border-top:1px solid var(--line);
  margin-top:4px;padding-top:12px;
}
.pay{
  width:100%;margin-top:10px;
  background:linear-gradient(90deg,var(--accent),var(--accent2));
  color:white;
}
.policy-note{margin-top:8px;color:var(--muted);text-align:right}

/* forms (basic inputs used elsewhere) */
.form input, .form textarea{
  background:white;color:var(--text);
  border:1px solid var(--line);border-radius:8px;
  padding:8px 10px;
}
.summary{
  margin-top:12px;background:white;border:1px solid var(--line);
  border-radius:10px;padding:12px;
}
.summary ul{padding-left:18px}

/* ==== Builder: 개선된 폼 전용 스타일 ==== */
.form-card{
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
  padding: 16px;
  display: grid;
  gap: 12px;
}
.form-title{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.form-title .emoji{font-size:18px}
.form-card .row{display:grid;gap:6px}
.form-card .pair{grid-template-columns:1fr 1fr;gap:12px}
@media (max-width: 720px){ .form-card .pair{grid-template-columns:1fr} }
.form-card label{font-size:13px;color:#475569;font-weight:600}
.form-card input,.form-card textarea{
  width:100%;padding:10px 12px;background:#fff;color:var(--text);
  border:1px solid var(--line);border-radius:10px;outline:none;
}
.form-card input:focus,.form-card textarea:focus{
  border-color:#c7d2fe;box-shadow:0 0 0 4px rgba(79,70,229,.12);
}
.form-card .mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  min-height:120px;resize:none;
}
.form-card .kv{display:grid;grid-template-columns:1fr 1fr auto;gap:10px}
.actions.end{display:flex;justify-content:flex-end;align-items:center}
.hint{color:#dc2626}

/* facade flow & receipt */
.flow .steps{
  display:flex;gap:8px;list-style:none;padding:0;margin:0 0 12px;
}
.flow .steps li{
  padding:6px 12px;border:1px solid var(--line);
  border-radius:999px;color:#64748b;
}
.flow .steps li.done{
  background:var(--accent);color:white;border-color:var(--accent);
}

/* receipt */
.receipt{
  margin-top:12px;background:white;
  border:1px solid var(--line);border-radius:10px;padding:12px;
}
.r-head{display:flex;align-items:center;gap:10px;color:#334155}
.badge{padding:4px 10px;border-radius:999px;font-weight:600;color:white}
.badge.ok{background:#22c55e}
.badge.fail{background:#ef4444}
.r-items{margin-top:8px}
.r-table{width:100%;border-collapse:collapse}
.r-table th{
  background:#f8fafc;color:#334155;padding:8px;border-bottom:1px solid var(--line)
}
.r-table td{padding:8px;border-bottom:1px solid var(--line)}
.r-table .num{text-align:right}
.err{color:var(--danger);font-weight:700;margin-top:8px}
</style>
