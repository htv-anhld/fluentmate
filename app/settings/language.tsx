import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import { PickerRow } from '@/components/settings/PickerRow';
import {
  usePreferencesStore,
  type AppLocale,
} from '@/store/preferencesStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

const LANGS: { id: AppLocale; flag: string; label: string; sub: string }[] = [
  { id: 'vi', flag: '🇻🇳', label: 'Tiếng Việt', sub: 'Vietnamese' },
  { id: 'en', flag: '🇺🇸', label: 'English', sub: 'English' },
];

function FlagAvatar({ emoji }: { emoji: string }) {
  return (
    <View style={styles.flag}>
      <Text style={styles.flagEmoji}>{emoji}</Text>
    </View>
  );
}

export default function LanguageSettings() {
  const { t } = useTranslation();
  const translationLanguage = usePreferencesStore(
    (s) => s.translationLanguage,
  );
  const appLanguage = usePreferencesStore((s) => s.appLanguage);
  const setTranslationLanguage = usePreferencesStore(
    (s) => s.setTranslationLanguage,
  );
  const setAppLanguage = usePreferencesStore((s) => s.setAppLanguage);

  return (
    <SettingsScaffold
      title={t('settings.languageTitle')}
      subtitle={t('settings.languageSubtitle')}
    >
      <View>
        <SectionLabel>{t('settings.sectionTranslation')}</SectionLabel>
        <View style={styles.list}>
          {LANGS.map((l) => (
            <PickerRow
              key={l.id}
              selected={translationLanguage === l.id}
              onPress={() => setTranslationLanguage(l.id)}
              title={l.label}
              detail={l.sub}
              leading={<FlagAvatar emoji={l.flag} />}
            />
          ))}
        </View>
        <Text style={styles.helper}>{t('settings.translationHelper')}</Text>
      </View>

      <View>
        <SectionLabel>{t('settings.sectionApp')}</SectionLabel>
        <View style={styles.list}>
          {LANGS.map((l) => (
            <PickerRow
              key={l.id}
              selected={appLanguage === l.id}
              onPress={() => setAppLanguage(l.id)}
              title={l.label}
              detail={l.sub}
              leading={<FlagAvatar emoji={l.flag} />}
            />
          ))}
        </View>
        <Text style={styles.helper}>{t('settings.appHelper')}</Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  helper: {
    ...typography.small,
    color: colors.muted,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    lineHeight: 18,
  },
  flag: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: { fontSize: 26 },
});
