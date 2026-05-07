import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { PickerRow } from '@/components/settings/PickerRow';
import { usePreferencesStore } from '@/store/preferencesStore';
import { VOICES, ACCENT_LABEL } from '@/constants/voices';
import { colors, typography } from '@/constants/theme';
import type { AIVoice } from '@/types';

function VoiceAvatar({ voice }: { voice: AIVoice }) {
  return (
    <View style={[styles.avatar, { backgroundColor: voice.gradient[0] }]}>
      <Text style={styles.avatarLetter}>{voice.name[0]}</Text>
    </View>
  );
}

export default function VoiceSettings() {
  const { t } = useTranslation();
  const voiceId = usePreferencesStore((s) => s.voiceId);
  const setVoice = usePreferencesStore((s) => s.setVoice);

  return (
    <SettingsScaffold
      title={t('settings.voiceTitle')}
      subtitle={t('settings.voiceSubtitle')}
    >
      <View style={{ gap: 10 }}>
        {VOICES.map((v) => (
          <PickerRow
            key={v.id}
            selected={voiceId === v.id}
            onPress={() => setVoice(v.id)}
            title={v.name}
            detail={ACCENT_LABEL[v.accent]}
            leading={<VoiceAvatar voice={v} />}
          />
        ))}
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    ...typography.h1,
    fontSize: 20,
    color: colors.card,
  },
});
