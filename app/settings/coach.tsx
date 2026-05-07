import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { PickerRow } from '@/components/settings/PickerRow';
import {
  useOnboardingStore,
  type CoachId,
} from '@/store/onboardingStore';
import { colors, typography } from '@/constants/theme';

const COACHES: {
  id: CoachId;
  emoji: string;
  emojiBg: string;
  nameKey: string;
  descKey: string;
}[] = [
  {
    id: 'onion',
    emoji: '🧅',
    emojiBg: '#FFF3E6',
    nameKey: 'settings.coachOnionName',
    descKey: 'settings.coachOnionDesc',
  },
  {
    id: 'luna',
    emoji: '🌙',
    emojiBg: '#EDE8F8',
    nameKey: 'settings.coachLunaName',
    descKey: 'settings.coachLunaDesc',
  },
  {
    id: 'max',
    emoji: '🎯',
    emojiBg: '#E5EEF3',
    nameKey: 'settings.coachMaxName',
    descKey: 'settings.coachMaxDesc',
  },
  {
    id: 'momo',
    emoji: '🐵',
    emojiBg: '#F5F0E8',
    nameKey: 'settings.coachMomoName',
    descKey: 'settings.coachMomoDesc',
  },
];

export default function CoachSettings() {
  const { t } = useTranslation();
  const coachId = useOnboardingStore((s) => s.coachId);
  const setCoach = useOnboardingStore((s) => s.setCoach);

  return (
    <SettingsScaffold
      title={t('settings.coachTitle')}
      subtitle={t('settings.coachSubtitle')}
    >
      <View style={{ gap: 10 }}>
        {COACHES.map((c) => (
          <PickerRow
            key={c.id}
            selected={coachId === c.id}
            onPress={() => setCoach(c.id)}
            title={t(c.nameKey)}
            detail={t(c.descKey)}
            leading={
              <View style={[styles.avatar, { backgroundColor: c.emojiBg }]}>
                <Text style={styles.emoji}>{c.emoji}</Text>
              </View>
            }
          />
        ))}
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26, lineHeight: 30 },
});
