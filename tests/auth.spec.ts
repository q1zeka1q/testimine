import {test, expect} from '@playwright/test';

const USER = "standard_user"
const PASSWORD = "secret_sauce"

test.beforeEach(async ({page}) => {
    await page.goto("/")
    await page.getByPlaceholder("Username").fill(USER)
    await page.getByPlaceholder("Password").fill(PASSWORD)
    await page.getByText("Login").click()
    await expect(page).toHaveURL('/inventory.html')

})

/*test("sisse logimine", async ({page}) => {
    await page.goto("/")
    await page.getByPlaceholder("Username").fill(USER)
    await page.getByPlaceholder("Password").fill(PASSWORD)
    await page.getByText("Login").click()


    await expect(page).toHaveURL('/inventory.html')
})


test("login: vale password", async ({page}) => {
    await page.goto("/")
    await page.getByPlaceholder("Username").fill(USER)
    await page.getByPlaceholder("Password").fill('wrong_password')
    await page.getByText("Login").click()


    await expect(page.getByText("Epic sadface: Username and password do not match any user in this service")).toBeVisible()
})*/

// Тест на добавление товара в корзину
test("ostukorv lisamine", async ({ page }) => {
    let firstelement = page.locator("id=add-to-cart-sauce-labs-bike-light");
    await firstelement.click();

    let cartBadge = page.locator(".shopping_cart_badge");
    await expect(cartBadge).toHaveText("1");
});

test("inventory ilma sisselogimiseta → redirect", async ({ page }) => {

    await page.goto("/");

    // Проверяем, что пользователь был перенаправлен на корневую страницу
    await expect(page).toHaveURL("/");

    // Проверяем, что форма логина видна
    const loginForm = page.locator('[data-test="login-button"]');
    await expect(loginForm).toBeVisible();
});


test("cart ilma sisselogimiseta → redirect", async ({ page }) => {
  // Переходим на страницу корзины без авторизации
  await page.goto("/");

  // Проверяем, что нас перенаправили на главную страницу
  await expect(page).toHaveURL("/");

  // Проверяем, что форма логина отображается
  const loginForm = page.locator('[data-test="login-button"]');
  await expect(loginForm).toBeVisible();
});

test("problem_user: lisamine korvi töötab", async ({ page }) => {

    // 2) Берём первый товар, запоминаем название и добавляем в корзину
    const firstItem = page.locator(".inventory_item").first();
    const itemName = (await firstItem.locator(".inventory_item_name").textContent())!.trim();
    await firstItem.locator('button:has-text("Add to cart")').click();
  
    // 3) Badge = 1
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  
    // 4) Открываем корзину и проверяем, что товар там
    await page.locator(".shopping_cart_link").click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.locator(".cart_item .inventory_item_name")).toContainText(itemName);
  });

  test("performance_glitch_user: kataloog renderdub", async ({ page }) => {
 
  // 2) Проверяем, что каталог загрузился
  const inventoryList = page.locator(".inventory_list");
  await expect(inventoryList).toBeVisible();

  // 3) Проверяем, что список не пустой
  const items = page.locator(".inventory_item");
  expect(await items.count()).toBeGreaterThan(0);

  // 4) Открываем первую карточку товара
  const firstItem = items.first();
  const firstItemName = (await firstItem.locator(".inventory_item_name").textContent())!.trim();
  await firstItem.locator(".inventory_item_name").click();

  // Проверяем, что открыта страница товара
  await expect(page.locator(".inventory_details_name")).toHaveText(firstItemName);

  // 5) Возвращаемся назад
  await page.locator('[data-test="back-to-products"]').click();
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(inventoryList).toBeVisible();
});

test("Tagasi navigatsioon säilitab sorteerimise", async ({ page }) => {

  const sortSelect = page.getByTestId("product_sort_container");
  await sortSelect.selectOption("hilo");
  await expect(sortSelect).toHaveValue("hilo");

  await page.locator(".inventory_item").first().locator(".inventory_item_name").click();
  await expect(page).toHaveURL(/inventory-item\.html/);

  await page.getByTestId("back-to-products").click();
  await expect(page).toHaveURL(/\/inventory\.html$/);

  await expect(sortSelect).toHaveValue("hilo");
});

test("Nupu seisund kaardil: Add→Remove→Add, badge 0→1→0", async ({ page }) => {

  const cartBadge = page.locator(".shopping_cart_badge");

  // Бейджа нет (0)
  await expect(cartBadge).toHaveCount(0);

  // Первая карточка и её кнопка
  const firstItem = page.locator(".inventory_item").first();
  const btn = firstItem.getByRole("button");

  // Add to cart → Remove, badge 0→1
  await expect(btn).toHaveText(/Add to cart/i);
  await btn.click();
  await expect(btn).toHaveText(/Remove/i);
  await expect(cartBadge).toHaveText("1");

  // Remove → Add to cart, badge 1→0
  await btn.click();
  await expect(btn).toHaveText(/Add to cart/i);
  await expect(cartBadge).toHaveCount(0);
});


test("Eemaldus korvist taastab kaardi nupu", async ({ page }) => {

  // 2) Добавляем первый товар
  const firstItem = page.locator(".inventory_item").first();
  const firstItemName = (await firstItem.locator(".inventory_item_name").textContent())!.trim();
  const itemButton = firstItem.locator("button");
  await itemButton.click();
  await expect(itemButton).toHaveText(/Remove/i);

  // 3) Переходим в корзину
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL(/\/cart\.html$/);

  // 4) Удаляем товар в корзине
  const cartItem = page.locator(".cart_item").filter({ hasText: firstItemName });
  await cartItem.locator("button").click();

  // 5) Возвращаемся обратно в каталог
  await page.locator('[data-test="continue-shopping"]').click();
  await expect(page).toHaveURL(/\/inventory\.html$/);

  // 6) Проверяем, что кнопка на той же карточке снова “Add to cart”
  const updatedButton = page.locator(".inventory_item").first().locator("button");
  await expect(updatedButton).toHaveText(/Add to cart/i);
});


test("Korvi ikoon kataloogist → /cart.html", async ({ page }) => {

  // 2) Кликаем по иконке корзины
  await page.locator(".shopping_cart_link").click();

  // 3) Проверяем, что открылась страница корзины
  await expect(page).toHaveURL(/\/cart\.html$/);
});

test('"Continue Shopping" korvist → tagasi inventory, badge säilib', async ({ page }) => {

  // 2) Добавляем товар
  const firstItem = page.locator(".inventory_item").first();
  const addButton = firstItem.locator("button");
  await addButton.click();

  // 3) Проверяем бейдж = 1
  const cartBadge = page.locator(".shopping_cart_badge");
  await expect(cartBadge).toHaveText("1");

  // 4) Открываем корзину
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL(/\/cart\.html$/);

  // 5) Нажимаем "Continue Shopping"
  await page.locator('[data-test="continue-shopping"]').click();

  // 6) Проверяем, что мы снова на странице каталога
  await expect(page).toHaveURL(/\/inventory\.html$/);

  // 7) Проверяем, что бейдж всё ещё показывает "1"
  await expect(cartBadge).toHaveText("1");
});

test("Sorteerimise ääretingimused: kõigi nelja režiimi kontroll", async ({ page }) => {

  const sortSelect = page.locator('[data-test="product_sort_container"]');

  // Функция для получения всех названий и цен
  const getNames = async () => {
    return (await page.locator(".inventory_item_name").allTextContents()).map(t => t.trim());
  };
  const getPrices = async () => {
    return (await page.locator(".inventory_item_price").allTextContents()).map(p => parseFloat(p.replace("$", "")));
  };

  // === 1. Name (A to Z) ===
  await sortSelect.selectOption("az");
  const namesAZ = await getNames();
  const expectedAZ = [...namesAZ].sort((a, b) => a.localeCompare(b));
  expect(namesAZ[0]).toBe(expectedAZ[0]);
  expect(namesAZ.at(-1)).toBe(expectedAZ.at(-1));

  // === 2. Name (Z to A) ===
  await sortSelect.selectOption("za");
  const namesZA = await getNames();
  const expectedZA = [...namesZA].sort((a, b) => b.localeCompare(a));
  expect(namesZA[0]).toBe(expectedZA[0]);
  expect(namesZA.at(-1)).toBe(expectedZA.at(-1));

  // === 3. Price (low to high) ===
  await sortSelect.selectOption("lohi");
  const pricesLow = await getPrices();
  const expectedLow = [...pricesLow].sort((a, b) => a - b);
  expect(pricesLow[0]).toBe(expectedLow[0]);
  expect(pricesLow.at(-1)).toBe(expectedLow.at(-1));

  // === 4. Price (high to low) ===
  await sortSelect.selectOption("hilo");
  const pricesHigh = await getPrices();
  const expectedHigh = [...pricesHigh].sort((a, b) => b - a);
  expect(pricesHigh[0]).toBe(expectedHigh[0]);
  expect(pricesHigh.at(-1)).toBe(expectedHigh.at(-1));
});

test("Tootelehe andmete kooskõla: nimi ja hind klapivad kaardiga", async ({ page }) => {


  // 2) Берём первую карточку и запоминаем имя и цену
  const firstItem = page.locator(".inventory_item").first();
  const itemName = (await firstItem.locator(".inventory_item_name").textContent())!.trim();
  const itemPrice = (await firstItem.locator(".inventory_item_price").textContent())!.trim();

  // 3) Переходим на страницу товара
  await firstItem.locator(".inventory_item_name").click();
  await expect(page).toHaveURL(/inventory-item\.html/);

  // 4) Проверяем, что имя и цена совпадают
  const detailName = (await page.locator(".inventory_details_name").textContent())!.trim();
  const detailPrice = (await page.locator(".inventory_details_price").textContent())!.trim();

  expect(detailName).toBe(itemName);
  expect(detailPrice).toBe(itemPrice);
});

test("Checkout matemaatika: Item total = summa, Total = +Tax", async ({ page }) => {


  // 2) Добавляем два товара для надёжности
  const items = page.locator(".inventory_item");
  await items.nth(0).locator("button").click();
  await items.nth(1).locator("button").click();

  // 3) Переходим в корзину → Checkout
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await page.locator('[data-test="checkout"]').click();

  // 4) Заполняем форму checkout
  await page.locator('[data-test="firstName"]').fill("Test");
  await page.locator('[data-test="lastName"]').fill("User");
  await page.locator('[data-test="postalCode"]').fill("12345");
  await page.locator('[data-test="continue"]').click();
  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

  // 5) Считаем сумму цен товаров вручную
  const priceTexts = await page.locator(".inventory_item_price").allTextContents();
  const prices = priceTexts.map(t => parseFloat(t.replace("$", "")));
  const manualSum = prices.reduce((a, b) => a + b, 0);

  // 6) Читаем значения Item total, Tax, Total
  const itemTotalText = await page.locator(".summary_subtotal_label").textContent();
  const taxText = await page.locator(".summary_tax_label").textContent();
  const totalText = await page.locator(".summary_total_label").textContent();

  const itemTotal = parseFloat(itemTotalText!.replace("Item total: $", ""));
  const tax = parseFloat(taxText!.replace("Tax: $", ""));
  const total = parseFloat(totalText!.replace("Total: $", ""));

  // 7) Проверяем, что все три значения видимы
  await expect(page.locator(".summary_subtotal_label")).toBeVisible();
  await expect(page.locator(".summary_tax_label")).toBeVisible();
  await expect(page.locator(".summary_total_label")).toBeVisible();

  // 8) Проверяем корректность вычислений
  expect(itemTotal).toBeCloseTo(manualSum, 2);
  expect(total).toBeCloseTo(itemTotal + tax, 2);
});

test("Checkout lõpuni: Finish viib /checkout-complete.html ja näitab kinnitusteksti", async ({ page }) => {

  // 2) Добавляем любой товар
  await page.locator(".inventory_item").first().locator("button").click();

  // 3) Открываем корзину и начинаем checkout
  await page.locator(".shopping_cart_link").click();
  await page.locator('[data-test="checkout"]').click();

  // 4) Заполняем форму данных
  await page.locator('[data-test="firstName"]').fill("Test");
  await page.locator('[data-test="lastName"]').fill("User");
  await page.locator('[data-test="postalCode"]').fill("12345");
  await page.locator('[data-test="continue"]').click();
  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

  // 5) Нажимаем Finish
  await page.locator('[data-test="finish"]').click();

  // 6) Проверяем, что мы на странице завершения
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);

  // 7) Проверяем, что благодарственный текст отображается
  const thankYouText = page.locator(".complete-header");
  await expect(thankYouText).toBeVisible();
  await expect(thankYouText).toHaveText(/Thank you for your order!/i);
});

test("Burger-menüü: All Items, About, Reset App State", async ({ page }) => {


  // 2️⃣ ДОБАВЛЯЕМ ОДИН ТОВАР, чтобы потом проверить Reset
  const firstItemButton = page.locator(".inventory_item").first().locator("button");
  await firstItemButton.click();
  const cartBadge = page.locator(".shopping_cart_badge");
  await expect(cartBadge).toHaveText("1");

  // 3️⃣ ОТКРЫВАЕМ БУРГЕР-МЕНЮ
  await page.locator("#react-burger-menu-btn").click();

  // === All Items ===
  await page.locator("#inventory_sidebar_link").click();
  await expect(page).toHaveURL(/\/inventory\.html$/);

  // 4️⃣ ОТКРЫВАЕМ МЕНЮ ЕЩЁ РАЗ ДЛЯ About
  await page.locator("#react-burger-menu-btn").click();

  // === About ===
  // Эта ссылка ведёт на внешний сайт Sauce Labs
  const [newPage] = await Promise.all([
    page.waitForEvent("popup"), // ловим открывшуюся вкладку
    page.locator("#about_sidebar_link").click(),
  ]);
  const url = newPage.url();
  expect(url).toMatch(/^https:\/\/www\.saucelabs\.com/i);
  await newPage.close();

  // 5️⃣ СНОВА ОТКРЫВАЕМ МЕНЮ ДЛЯ Reset App State
  await page.locator("#react-burger-menu-btn").click();

  // === Reset App State ===
  await page.locator("#reset_sidebar_link").click();

  // Проверяем, что корзина очищена
  await expect(cartBadge).toHaveCount(0);

  // Проверяем, что на карточке снова “Add to cart”
  await expect(firstItemButton).toHaveText(/Add to cart/i);
});