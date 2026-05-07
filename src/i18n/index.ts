import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';
import { usePreferencesStore } from '@/store/preferencesStore';

// Initialize once at module load.
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: usePreferencesStore.getState().appLanguage,
    fallbackLng: 'vi',
    compatibilityJSON: 'v4',
    interpolation: { escapeValue: false },
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.warn('[i18n] init failed:', e);
  });

// Reactively switch i18n language when user changes appLanguage in Settings.
usePreferencesStore.subscribe((state, prev) => {
  if (state.appLanguage !== prev.appLanguage) {
    void i18n.changeLanguage(state.appLanguage);
  }
});

export { i18n };
