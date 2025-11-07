export interface LineItem {
  id: string;
  title: string;
  price: number; // 단가
  qty: number;
  category?: "book" | "digital" | "grocery" | "fashion" | "other";
}

export interface UserProfile {
  id: string;
  name: string;
  level?: "guest" | "member" | "vip";
  coupons?: string[]; // 예: ["WELCOME10"]
}

// 장바구니 합계 계산을 위해 필요한 입력
export interface PricingInput {
  items: LineItem[];
  user?: UserProfile;
  now?: Date; // 테스트에서 시간을 고정하기 위함
}

export interface PricingStrategy {
  name: string;
  computeDiscount(input: PricingInput): number;
}

export class PercentageOffStrategy implements PricingStrategy {
  constructor(public readonly name: string, private readonly percent: number) {}
  computeDiscount(input: PricingInput): number {
    const subtotal = input.items.reduce((acc, it) => acc + it.price * it.qty, 0);
    return Math.max(0, Math.floor((subtotal * this.percent) / 100));
  }
}

// 2) 정액 할인 (N원 할인)
export class FixedAmountOffStrategy implements PricingStrategy {
  constructor(public readonly name: string, private readonly amount: number) {}
  computeDiscount(_input: PricingInput): number {
    return Math.max(0, this.amount);
  }
}

// 3) 카테고리 한정 할인 (예: book 10%)
export class CategoryPercentageOffStrategy implements PricingStrategy {
  constructor(
    public readonly name: string,
    private readonly category: NonNullable<LineItem["category"]>,
    private readonly percent: number
  ) {}
  computeDiscount(input: PricingInput): number {
    const targetSum = input.items
      .filter((i) => i.category === this.category)
      .reduce((acc, it) => acc + it.price * it.qty, 0);
    return Math.max(0, Math.floor((targetSum * this.percent) / 100));
  }
}

// 4) VIP 전용 할인
export class VipOnlyStrategy implements PricingStrategy {
  constructor(public readonly name: string, private readonly amount: number) {}
  computeDiscount(input: PricingInput): number {
    if (input.user?.level === "vip") return this.amount;
    return 0;
  }
}

// 5) 쿠폰 코드 기반 (여러 코드 지원)
export class CouponStrategy implements PricingStrategy {
  constructor(
    public readonly name: string,
    private readonly couponMap: Record<string, number> // 쿠폰코드→정액할인
  ) {}
  computeDiscount(input: PricingInput): number {
    const coupons = input.user?.coupons ?? [];
    return coupons.reduce((sum, c) => sum + (this.couponMap[c] ?? 0), 0);
  }
}

// 6) 기간 한정 시즌 할인 (예: 블랙프라이데이 주간 15%)
export class SeasonalStrategy implements PricingStrategy {
  constructor(
    public readonly name: string,
    private readonly start: Date,
    private readonly end: Date,
    private readonly percent: number
  ) {}
  computeDiscount(input: PricingInput): number {
    const now = input.now ?? new Date();
    if (now < this.start || now > this.end) return 0;
    const subtotal = input.items.reduce((acc, it) => acc + it.price * it.qty, 0);
    return Math.floor((subtotal * this.percent) / 100);
  }
}

export type CombinePolicy = "sum" | "max";

export class PriceCalculator {
  private strategies: PricingStrategy[] = [];
  private policy: CombinePolicy = "sum";

  setPolicy(policy: CombinePolicy): this {
    this.policy = policy;
    return this;
  }

  addStrategy(s: PricingStrategy): this {
    this.strategies.push(s);
    return this;
  }

  removeStrategyByName(name: string): this {
    this.strategies = this.strategies.filter((s) => s.name !== name);
    return this;
  }

  clearStrategies(): this {
    this.strategies = [];
    return this;
  }

  compute(input: PricingInput) {
    const subtotal = input.items.reduce((acc, it) => acc + it.price * it.qty, 0);

    const discounts = this.strategies.map((s) => ({
      name: s.name,
      amount: Math.max(0, s.computeDiscount(input)),
    }));

    const totalDiscount =
      this.policy === "sum"
        ? discounts.reduce((sum, d) => sum + d.amount, 0)
        : Math.max(0, ...discounts.map((d) => d.amount), 0);

    const final = Math.max(0, subtotal - totalDiscount);
    return {
      subtotal,
      discounts, // 각 전략별 금액
      totalDiscount,
      final,
      policy: this.policy,
    };
  }
}
export function exampleStrategyFlow() {
  const items: LineItem[] = [
    { id: "p1", title: "Vue 마스터북", price: 25000, qty: 1, category: "book" },
    { id: "p2", title: "후드티", price: 40000, qty: 1, category: "fashion" },
    { id: "p3", title: "디지털 강의", price: 120000, qty: 1, category: "digital" },
  ];
  const user: UserProfile = { id: "u1", name: "saim", level: "vip", coupons: ["WELCOME10"] };

  const start = new Date("2025-11-20T00:00:00Z");
  const end = new Date("2025-11-30T23:59:59Z");

  const calc = new PriceCalculator()
    .setPolicy("sum") // "max"로 바꾸면 혜택 중 최대만 적용
    .addStrategy(new PercentageOffStrategy("전체 5% 할인", 5))
    .addStrategy(new CategoryPercentageOffStrategy("도서 10%", "book", 10))
    .addStrategy(new VipOnlyStrategy("VIP 전용 7,000원", 7000))
    .addStrategy(new CouponStrategy("쿠폰", { WELCOME10: 10000 }))
    .addStrategy(new SeasonalStrategy("블프 15%", start, end, 15));

  // now를 고정하여 시즌할인이 적용되도록 테스트
  const res = calc.compute({ items, user, now: new Date("2025-11-25T09:00:00Z") });
  return res;
}
