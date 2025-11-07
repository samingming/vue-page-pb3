# 🎨 Vue Design Pattern Showcase  
Vue 3 + TypeScript로 구현한 **디자인 패턴 3종(Strategy / Builder / Facade)** 데모 페이지입니다.  
각 패턴은 실제 웹 서비스 시나리오에 맞춰 구성되어 시각적으로 이해하기 쉽도록 제작되었습니다.

---

## 📌 프로젝트 개요
이 프로젝트는 강의 요구사항에 따라  
✅ **생성(Creational)** — Builder Pattern  
✅ **구조(Structural)** — Facade Pattern  
✅ **행위(Behavioral)** — Strategy Pattern  
을 각각 Vue + TypeScript로 구현한 예시입니다.

각 패턴은 별도 탭 UI로 구성되어, 사용자가 직접 동작을 조작하거나 데모를 실행해 **패턴의 핵심 아이디어를 직관적으로 체험**할 수 있도록 설계하였습니다.

---

# 🚀 페이지 구성

## 1️⃣ Strategy Pattern — 장바구니 할인 전략
**여러 할인 정책을 조합하거나(합산 / 최대)**  
사용자가 체크박스로 전략을 켜고 끄면서 결과가 실시간 반영되는 장바구니 UI입니다.

### 구현된 전략들
- 전체 5% 할인 (`PercentageOffStrategy`)
- 도서 10% 할인 (`CategoryPercentageOffStrategy`)
- VIP 전용 7,000원 할인 (`VipOnlyStrategy`)
- 쿠폰 코드 할인 (`CouponStrategy`)
- 시즌 한정 15% 할인 (`SeasonalStrategy`)

### 특징
- 사용자가 수량/가격/전략을 바꾸면 즉시 계산
- 합산(sum) / 최대(max) 두 가지 방식 지원
- 실제 쇼핑몰의 장바구니처럼 시각적 UI로 표현

✅ **디자인 패턴 핵심:**  
💡 *전략(Strategy)을 객체로 정의해 상황에 따라 교체 가능하도록 구성*

---

## 2️⃣ Builder Pattern — HTTP Request 조립기
`HttpRequestBuilder` + `ApiDirector`를 이용해  
**HTTP 요청 객체를 단계적으로 조립**하는 기능을 직접 시연합니다.

### 구성 요소
- JSON POST 요청 빌더
- Authorization Header가 포함된 GET 요청 빌더
- QueryString을 UI에서 직접 추가/삭제 가능
- 생성된 요청을 카드 형태로 요약 출력

✅ **디자인 패턴 핵심:**  
💡 *복잡한 객체 생성 과정을 단계적으로 나누어 일관된 생성 절차 제공*

---

## 3️⃣ Facade Pattern — 주문 → 결제 플로우
여러 서브시스템(Auth, Product, Cart, Payment)을  
`ShopFacade`에서 단일 함수로 묶어 **단순한 API처럼 실행**할 수 있게 만든 예제.

### 시연 기능
- 로그인
- 상품 목록 조회
- 장바구니 생성
- 결제 실행
- 영수증 카드 출력

✅ **디자인 패턴 핵심:**  
💡 *여러 복잡한 시스템을 하나의 단순한 인터페이스로 감싸 제공*

---

# 🖼️ UI 예시 (스크린샷 첨부)
아래 스크린샷들은 실제 페이지에서 촬영한 예시입니다.

> 📸 *원하는 위치에 이미지 드래그 앤 드롭해서 넣으면 됩니다.*

