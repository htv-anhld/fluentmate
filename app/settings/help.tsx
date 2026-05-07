import { Pressable, View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import Constants from 'expo-constants';
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/constants/legal';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  detail?: string;
  onPress: () => void;
};

function HelpRow({ item }: { item: Item }) {
  return (
    <Pressable
      onPress={item.onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function HelpSettings() {
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('settings.helpOpenFail'), url);
    });
  };

  const showStatic = (title: string, body: string) =>
    Alert.alert(title, body);

  const supportItems: Item[] = [
    {
      icon: 'help-circle',
      iconColor: colors.blue,
      iconBg: colors.blueLight,
      title: t('settings.helpFaqTitle'),
      detail: t('settings.helpFaqDetail'),
      onPress: () =>
        showStatic(t('settings.helpFaqDetail'), t('settings.helpFaqBody')),
    },
    {
      icon: 'mail',
      iconColor: colors.orange,
      iconBg: colors.orangeSoft,
      title: t('settings.helpEmailTitle'),
      detail: SUPPORT_EMAIL,
      onPress: () =>
        openLink(
          `mailto:${SUPPORT_EMAIL}?subject=FluentMate%20Support`,
        ),
    },
  ];

  const legalItems: Item[] = [
    {
      icon: 'document-text',
      iconColor: colors.ink2,
      iconBg: colors.bg,
      title: t('settings.helpTerms'),
      onPress: () => openLink(TERMS_URL),
    },
    {
      icon: 'lock-closed',
      iconColor: colors.ink2,
      iconBg: colors.bg,
      title: t('settings.helpPrivacy'),
      onPress: () => openLink(PRIVACY_URL),
    },
    {
      icon: 'document',
      iconColor: colors.ink2,
      iconBg: colors.bg,
      title: t('settings.helpOss'),
      onPress: () =>
        showStatic(t('settings.helpOssTitle'), t('settings.helpOssBody')),
    },
  ];

  return (
    <SettingsScaffold title={t('settings.helpTitle')}>
      <View>
        <SectionLabel>{t('settings.helpSectionSupport')}</SectionLabel>
        <View style={styles.list}>
          {supportItems.map((it) => (
            <HelpRow key={it.title} item={it} />
          ))}
        </View>
      </View>

      <View>
        <SectionLabel>{t('settings.helpSectionLegal')}</SectionLabel>
        <View style={styles.list}>
          {legalItems.map((it) => (
            <HelpRow key={it.title} item={it} />
          ))}
        </View>
      </View>

      <View style={styles.about}>
        <Text style={styles.brand}>FluentMate</Text>
        <Text style={styles.version}>
          {t('settings.helpVersion', { v: version })}
        </Text>
        <Text style={styles.tagline}>{t('settings.helpTagline')}</Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: { ...typography.h3, color: colors.ink },
  detail: { ...typography.caption, color: colors.muted },
  about: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    gap: 4,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.blueDark,
    letterSpacing: -0.5,
  },
  version: {
    ...typography.small,
    color: colors.muted,
  },
  tagline: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 4,
  },
});
