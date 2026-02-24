// Polyfill ResizeObserver for jsdom (required by Vuetify)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
