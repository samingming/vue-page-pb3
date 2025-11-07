export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}
function err(error: string): Err {
  return { ok: false, error };
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Domain 모델 ----------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  token: string;
}
export interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
}
export interface CartItem {
  productId: string;
  qty: number;
}
export interface Order {
  id: string;
  items: Array<{ productId: string; qty: number; price: number }>;
  total: number;
  paid: boolean;
}

// 서브시스템들
// 1) 인증
class AuthService {
  private currentUser: User | null = null;

  async login(username: string, password: string): Promise<Result<User>> {
    // mock rule
    if (!username || !password) return err("아이디/비밀번호를 입력하세요.");
    const user: User = {
      id: "u_1",
      name: username,
      token: "TOKEN_" + Math.random().toString(36).slice(2),
    };
    this.currentUser = user;
    return delay(ok(user));
  }

  async logout(): Promise<Result<true>> {
    this.currentUser = null;
    return delay(ok(true));
  }

  getUser(): User | null {
    return this.currentUser;
  }
}

// 2) 상품
class ProductService {
  private products: Product[] = [
    { id: "p1", title: "Vue 마스터북", price: 25000, stock: 5 },
    { id: "p2", title: "TypeScript 핸드북", price: 30000, stock: 2 },
    { id: "p3", title: "디자인 패턴 가이드", price: 35000, stock: 10 },
  ];

  async list(): Promise<Result<Product[]>> {
    return delay(ok(this.products.map((p) => ({ ...p }))));
  }

  async getById(id: string): Promise<Result<Product>> {
    const found = this.products.find((p) => p.id === id);
    return delay(found ? ok({ ...found }) : err("상품을 찾을 수 없습니다."));
  }

  async reserveStock(id: string, qty: number): Promise<Result<true>> {
    const found = this.products.find((p) => p.id === id);
    if (!found) return delay(err("상품이 존재하지 않습니다."));
    if (found.stock < qty) return delay(err("재고가 부족합니다."));
    found.stock -= qty; // 예약
    return delay(ok(true));
  }
}

// 3) 장바구니
class CartService {
  private items: CartItem[] = [];

  async add(productId: string, qty = 1): Promise<Result<CartItem[]>> {
    if (qty <= 0) return err("수량은 1 이상이어야 합니다.");
    const ex = this.items.find((i) => i.productId === productId);
    if (ex) ex.qty += qty;
    else this.items.push({ productId, qty });
    return delay(ok(this.items.map((i) => ({ ...i }))));
  }

  async clear(): Promise<Result<true>> {
    this.items = [];
    return delay(ok(true));
  }

  getItems(): CartItem[] {
    return this.items.map((i) => ({ ...i }));
  }
}

// 4) 결제
class PaymentGateway {
  async pay(amount: number, token: string): Promise<Result<{ txId: string }>> {
    if (!token) return err("인증 토큰이 없습니다.");
    if (amount <= 0) return err("결제 금액이 올바르지 않습니다.");
    return delay(ok({ txId: "tx_" + Math.random().toString(36).slice(2) }), 400);
  }
}

export class ShopFacade {
  constructor(
    private readonly auth = new AuthService(),
    private readonly product = new ProductService(),
    private readonly cart = new CartService(),
    private readonly payment = new PaymentGateway()
  ) {}

  // 노출하고 싶은 간단한 API들만 정의
  async signIn(username: string, password: string) {
    return this.auth.login(username, password);
  }

  async signOut() {
    return this.auth.logout();
  }

  async listProducts() {
    return this.product.list();
  }

  async addToCart(productId: string, qty = 1) {
    // 복잡한 정책은 Facade 내부에서 조합
    const p = await this.product.getById(productId);
    if (!p.ok) return p;
    // 예약(재고 차감)
    const r = await this.product.reserveStock(productId, qty);
    if (!r.ok) return r;
    return this.cart.add(productId, qty);
  }

  getCartItems(): CartItem[] {
    return this.cart.getItems();
  }

  async checkout(): Promise<Result<Order>> {
    const user = this.auth.getUser();
    if (!user) return err("로그인이 필요합니다.");

    const items = this.cart.getItems();
    if (items.length === 0) return err("장바구니가 비어 있습니다.");

    // 총액 계산
    let total = 0;
    const detailed: Order["items"] = [];
    for (const it of items) {
      const p = await this.product.getById(it.productId);
      if (!p.ok) return err(`상품 조회 실패: ${it.productId}`);
      total += p.data.price * it.qty;
      detailed.push({ productId: it.productId, qty: it.qty, price: p.data.price });
    }

    // 결제
    const paid = await this.payment.pay(total, user.token);
    if (!paid.ok) return err("결제 실패: " + paid.error);

    // 주문 생성
    const order: Order = {
      id: "order_" + paid.data.txId,
      items: detailed,
      total,
      paid: true,
    };

    // 장바구니 비우기
    await this.cart.clear();

    return ok(order);
  }
}

// 간단 실행 예시(테스트/데모용) ----------------------------------------------
export async function exampleFacadeFlow() {
  const shop = new ShopFacade();

  const login = await shop.signIn("saim", "1234");
  if (!login.ok) return login;

  const list = await shop.listProducts();
  if (!list.ok) return list;

  await shop.addToCart(list.data[0].id, 1);
  await shop.addToCart(list.data[1].id, 2);

  const order = await shop.checkout();
  return order;
}
