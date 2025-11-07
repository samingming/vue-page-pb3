<template>
  <div id="app">
    <header class="nav">
      <div class="brand">
        <img src="../assets/logo.png" alt="logo" />
        <h1>Strategy Store</h1>
      </div>
      <div class="right">
        <span class="badge" :title="user.level?.toUpperCase()">VIP</span>
      </div>
    </header>

    <main class="container">
      <!-- Cart -->
      <section class="card cart">
        <div class="card-head">
          <h2>🛒 내 장바구니</h2>
          <button class="ghost" @click="resetCart">초기화</button>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>상품</th>
              <th class="num">단가</th>
              <th class="qty">수량</th>
              <th class="num">소계</th>
            </tr>
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
      </section>

      <!-- Strategies -->
      <section class="card strategies">
        <div class="card-head">
          <h2>🧩 할인 전략 (Strategy)</h2>
          <div class="policy">
            <label>
              <input type="radio" value="sum" v-model="policy" />
              합산(sum)
            </label>
            <label>
              <input type="radio" value="max" v-model="policy" />
              최대(max)
            </label>
          </div>
        </div>

        <div class="grid">
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
            <input
              class="coupon"
              placeholder="예: WELCOME10"
              v-model="couponInput"
              @keydown.enter.prevent="applyCoupon"
            />
            <button class="ghost" @click="applyCoupon">적용</button>
          </div>

          <label class="switch">
            <input type="checkbox" v-model="enabled.season" />
            <span>시즌 15% (11/20~11/30)</span>
          </label>
        </div>

        <div class="chips" v-if="user.coupons?.length">
          <span class="chip" v-for="c in user.coupons" :key="c">{{ c }}</span>
          <button class="ghost small" @click="clearCoupons">쿠폰 초기화</button>
        </div>
      </section>

      <!-- Summary -->
      <section class="card summary">
        <h2>📋 결제 요약</h2>

        <ul class="discounts" v-if="result.discounts.length">
          <li v-for="d in result.discounts" :key="d.name">
            <span>{{ d.name }}</span>
            <span class="minus">- {{ money(d.amount) }}</span>
          </li>
        </ul>
        <p v-else class="muted">적용된 할인 없음</p>

        <div class="totals">
          <div class="row">
            <span>소계</span>
            <span>{{ money(result.subtotal) }}</span>
          </div>
          <div class="row">
            <span>총 할인</span>
            <span class="minus">- {{ money(result.totalDiscount) }}</span>
          </div>
          <div class="row final">
            <span>결제 금액</span>
            <span class="strong">{{ money(result.final) }}</span>
          </div>
        </div>

        <button class="pay" :disabled="result.final === 0">결제하기</button>
        <p class="policy-note">정책: <b>{{ result.policy }}</b></p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import {
  PriceCalculator,
  PercentageOffStrategy,
  CategoryPercentageOffStrategy,
  VipOnlyStrategy,
  CouponStrategy,
  SeasonalStrategy,
  type LineItem,
  type UserProfile,
  type CombinePolicy
} from '@/design-pattern/behavioral/strategy'

const items = reactive<LineItem[]>([
  { id: 'p1', title: 'Vue 마스터북', price: 25000, qty: 1, category: 'book' },
  { id: 'p2', title: '후드티',     price: 40000, qty: 1, category: 'fashion' },
  { id: 'p3', title: '디지털 강의', price:120000, qty: 1, category: 'digital' }
])

const user = reactive<UserProfile>({
  id: 'u1', name: 'saim', level: 'vip', coupons: ['WELCOME10']
})

const enabled = reactive({ all5: true, book10: true, vip7000: true, coupon: true, season: true })
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

function money(n: number) { return n.toLocaleString() + '원' }
function inc(it: LineItem) { it.qty++ }
function dec(it: LineItem) { it.qty = Math.max(0, it.qty - 1) }
function setQty(it: LineItem, e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  it.qty = isNaN(v) ? 0 : Math.max(0, Math.floor(v))
}
function resetCart() { items[0].qty = 1; items[1].qty = 1; items[2].qty = 1 }
function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase()
  if (!code) return
  if (!user.coupons) user.coupons = []
  if (!user.coupons.includes(code)) user.coupons.push(code)
  couponInput.value = ''
}
function clearCoupons() { user.coupons = [] }
</script>

<style scoped>
/* (스타일은 이전 버전과 동일) */
:root { --bg:#0b1220; --panel:#0f172a; --panel-2:#111827; --text:#e5e7eb; --muted:#9aa6b2; --line:rgba(255,255,255,.08); --accent:#4f46e5; --accent2:#22c55e; --danger:#ef4444; }
*{box-sizing:border-box}
#app{min-height:100vh;background:radial-gradient(1200px 600px at 20% 0%, #10192b 0%, #0b1220 60%);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Apple SD Gothic Neo,Malgun Gothic,"맑은 고딕",Arial}
.nav{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#0f172a,#0b1220);position:sticky;top:0;z-index:5}
.brand{display:flex;align-items:center;gap:12px}
.brand img{width:32px;height:32px}
.brand h1{font-size:18px;margin:0;letter-spacing:.3px}
.badge{background:var(--accent);color:#fff;padding:4px 10px;border-radius:999px;font-weight:700}
.container{display:grid;grid-template-columns:1.2fr .9fr .9fr;gap:16px;padding:20px}
@media (max-width:1100px){.container{grid-template-columns:1fr}}
.card{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 30px rgba(0,0,0,.35);padding:16px}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.card h2{margin:0 0 6px;font-size:18px}
.table{width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.table th,.table td{padding:10px 8px;border-bottom:1px solid var(--line)}
.table th{text-align:left;color:var(--muted);font-weight:600}
.table .num{text-align:right;white-space:nowrap}
.table .qty{display:flex;align-items:center;gap:6px}
.table input{width:64px;padding:6px 8px;background:#0b1220;color:var(--text);border:1px solid var(--line);border-radius:8px}
.table .prod .title{display:block;font-weight:700}
.table .prod .cat{color:var(--muted)}
.table tfoot td{border-bottom:none}
.right{text-align:right}
.strong{font-weight:800}
button{background:var(--accent);color:#fff;border:none;padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:700}
button.ghost{background:transparent;border:1px solid var(--line);color:var(--text)}
button.ghost.small{padding:6px 10px;font-size:12px}
button:disabled{opacity:.6;cursor:not-allowed}
.switch{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0b1220;border:1px solid var(--line);border-radius:10px}
.grid{display:grid;grid-template-columns:1fr;gap:10px}
.coupon-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center}
.coupon{width:100%;padding:8px 10px;background:#0b1220;color:var(--text);border:1px solid var(--line);border-radius:10px}
.discounts{list-style:none;margin:0 0 12px;padding:0;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.discounts li{display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--line)}
.discounts li:last-child{border-bottom:none}
.minus{color:#a3e635}
.muted{color:var(--muted)}
.totals{border-top:1px dashed var(--line);padding-top:10px}
.totals .row{display:flex;justify-content:space-between;padding:8px 0}
.totals .row.final{border-top:1px solid var(--line);margin-top:4px;padding-top:12px}
.pay{width:100%;margin-top:10px;background:linear-gradient(90deg,var(--accent),var(--accent2))}
.policy-note{margin:8px 0 0;color:var(--muted);text-align:right}
</style>
