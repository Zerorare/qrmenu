/**
 * Interface language, chosen per restaurant in /admin/settings.
 *
 * Menu item names come from the database and are whatever the owner typed;
 * this only covers the surrounding interface — buttons, statuses, the text
 * printed on the QR cards.
 */

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

const STRINGS = {
  en: {
    /* guest menu */
    menuCategories: 'Menu categories',
    reviewOrder: 'Review order',
    yourOrder: 'Your order',
    close: 'Close',
    subtotal: 'Subtotal',
    service: 'Service',
    total: 'Total',
    noteLabel: 'Anything the kitchen should know?',
    notePlaceholder: 'No onions, extra bread…',
    sending: 'Sending…',
    sendOrder: 'Send order',
    payNote: 'You pay at the table as usual — this only sends the order to the staff.',
    inclService: (pct) => `incl. ${pct}% service`,
    orderSent: (id) => `Order #${id} sent`,
    orderAgain: 'Order something else',
    soldOut: 'Sold out',
    addItem: (name) => `Add ${name}`,
    addOne: (name) => `Add one ${name}`,
    removeOne: (name) => `Remove one ${name}`,
    itemCount: (n) => `${n} ${n === 1 ? 'item' : 'items'}`,
    status: {
      new: ['Sent to the kitchen', 'The staff have your order.'],
      preparing: ['Being prepared', 'Your food is on the stove.'],
      ready: ['Ready', 'Coming to your table now.'],
      served: ['Served', 'Enjoy your meal!'],
      cancelled: ['Cancelled', 'Please speak to a staff member.'],
    },

    /* staff board */
    colNew: 'New',
    colPreparing: 'Preparing',
    colReady: 'Ready',
    actStart: 'Start preparing',
    actReady: 'Mark ready',
    actServed: 'Served',
    turnOnSound: '🔔 Turn on sound',
    soundHint: 'Tap “Turn on sound” once and this screen will chime whenever a table orders.',
    showServed: 'Served today',
    hideServed: 'Hide served',
    signOut: 'Sign out',
    live: 'Live',
    reconnecting: 'Reconnecting…',
    emptyColumn: 'Nothing here right now',
    servedToday: 'Served & cancelled today',
    noCompleted: 'No completed orders yet.',
    thTable: 'Table',
    thItems: 'Items',
    thTotal: 'Total',
    thStatus: 'Status',
    stServed: 'Served',
    stCancelled: 'Cancelled',
    cancelOrder: (id) => `Cancel order ${id}`,
    justNow: 'just now',
    minsAgo: (m) => `${m} min ago`,
    hoursAgo: (h, m) => `${h} h ${m} min ago`,

    /* login */
    staffTitle: 'Staff order screen',
    staffSubtitle: 'Enter the PIN your manager gave you to see incoming table orders.',
    staffPin: 'Staff PIN',
    signIn: 'Sign in',
    checking: 'Checking…',

    /* printed QR card */
    qrScan: 'Scan to see the menu',
    qrOrder: 'and order from your phone',
  },

  ru: {
    menuCategories: 'Разделы меню',
    reviewOrder: 'Посмотреть заказ',
    yourOrder: 'Ваш заказ',
    close: 'Закрыть',
    subtotal: 'Сумма',
    service: 'Сервисный сбор',
    total: 'Итого',
    noteLabel: 'Что-то передать на кухню?',
    notePlaceholder: 'Без лука, побольше хлеба…',
    sending: 'Отправляем…',
    sendOrder: 'Отправить заказ',
    payNote: 'Оплата как обычно — это только передаёт заказ персоналу.',
    inclService: (pct) => `вкл. сервисный сбор ${pct}%`,
    orderSent: (id) => `Заказ №${id} отправлен`,
    orderAgain: 'Заказать ещё',
    soldOut: 'Закончилось',
    addItem: (name) => `Добавить ${name}`,
    addOne: (name) => `Добавить ещё ${name}`,
    removeOne: (name) => `Убрать одну порцию ${name}`,
    itemCount: (n) => `${n} ${plural(n, 'блюдо', 'блюда', 'блюд')}`,
    status: {
      new: ['Заказ отправлен', 'Персонал получил ваш заказ.'],
      preparing: ['Готовится', 'Ваш заказ уже готовят.'],
      ready: ['Готово', 'Сейчас принесут к вашему столу.'],
      served: ['Подано', 'Приятного аппетита!'],
      cancelled: ['Отменён', 'Обратитесь, пожалуйста, к персоналу.'],
    },

    colNew: 'Новые',
    colPreparing: 'Готовятся',
    colReady: 'Готово',
    actStart: 'Взять в работу',
    actReady: 'Готово',
    actServed: 'Подано',
    turnOnSound: '🔔 Включить звук',
    soundHint: 'Нажмите «Включить звук» один раз — и экран будет звенеть при новом заказе.',
    showServed: 'Поданные сегодня',
    hideServed: 'Скрыть',
    signOut: 'Выйти',
    live: 'На связи',
    reconnecting: 'Переподключение…',
    emptyColumn: 'Пока пусто',
    servedToday: 'Поданные и отменённые сегодня',
    noCompleted: 'Пока нет завершённых заказов.',
    thTable: 'Стол',
    thItems: 'Блюда',
    thTotal: 'Сумма',
    thStatus: 'Статус',
    stServed: 'Подано',
    stCancelled: 'Отменён',
    cancelOrder: (id) => `Отменить заказ ${id}`,
    justNow: 'только что',
    minsAgo: (m) => `${m} ${plural(m, 'минута', 'минуты', 'минут')} назад`,
    hoursAgo: (h, m) => `${h} ч ${m} мин назад`,

    staffTitle: 'Экран заказов',
    staffSubtitle: 'Введите PIN-код, который дал управляющий, чтобы видеть заказы со столов.',
    staffPin: 'PIN-код',
    signIn: 'Войти',
    checking: 'Проверяем…',

    qrScan: 'Отсканируйте, чтобы открыть меню',
    qrOrder: 'и заказать со своего телефона',
  },
};

/** Russian needs three forms: 1 минута, 2 минуты, 5 минут. */
function plural(n, one, few, many) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** Returns the string table for a restaurant, falling back to English. */
export function t(language) {
  return STRINGS[language] ?? STRINGS.en;
}
