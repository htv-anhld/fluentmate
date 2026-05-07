import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { PickerRow } from '@/components/settings/PickerRow';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { ConversationSpeed } from '@/types';

const SPEEDS: { value: ConversationSpeed; label: string; detailKey: string }[] = [
  { value: 0.7, label: '0.7×', detailKey: 'settings.speedDetail070' },
  { value: 0.85, label: '0.85×', detailKey: 'settings.speedDetail085' },
  { value: 1.0, label: '1.0×', detailKey: 'settings.speedDetail100' },
  { value: 1.15, label: '1.15×', detailKey: 'settings.speedDetail115' },
  { value: 1.25, label: '1.25×', detailKey: 'settings.speedDetail125' },
];

export default function SpeedSettings() {
  const { t } = useTranslation();
  const speed = usePreferencesStore((s) => s.speed);
  const setSpeed = usePreferencesStore((s) => s.setSpeed);

  return (
    <SettingsScaffold
      title={t('settings.speedTitle')}
      subtitle={t('settings.speedSubtitle')}
    >
      <View style={styles.list}>
        {SPEEDS.map((s) => (
          <PickerRow
            key={s.value}
            selected={speed === s.value}
            onPress={() => setSpeed(s.value)}
            title={s.label}
            detail={t(s.detailKey)}
          />
        ))}
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
});
