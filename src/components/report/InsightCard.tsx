import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string | string[];
};

export function InsightCard({ icon, iconColor, iconBg, title, body }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {Array.isArray(body) ? (
          <View style={styles.list}>
            {body.map((line, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.text}>{body}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 8 },
  title: {
    ...typography.h3,
    color: colors.ink,
  },
  text: {
    ...typography.body,
    fontSize: 13,
    color: colors.ink2,
    lineHeight: 19,
  },
  list: { gap: 6 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
    marginTop: 8,
  },
  bulletText: {
    ...typography.body,
    fontSize: 13,
    color: colors.ink2,
    lineHeight: 19,
    flex: 1,
  },
});
