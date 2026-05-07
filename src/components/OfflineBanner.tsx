import { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/constants/theme';

/**
 * Sticky banner at the top of the screen when the device is offline.
 * Mounted globally in `app/_layout.tsx` so it covers every screen.
 *
 * Subscribes to NetInfo. Hidden when network is reachable, slides in when
 * isInternetReachable is explicitly false (we wait until detection is settled
 * to avoid a flash on cold start).
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      // `isConnected` is the basic interface state; `isInternetReachable`
      // does an extra reachability check (can be null briefly on launch).
      const reachable =
        state.isConnected !== false && state.isInternetReachable !== false;
      setOffline(!reachable);
    });
    return unsub;
  }, []);

  if (!offline) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={styles.wrap}
      pointerEvents="none"
    >
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.row}>
          <Ionicons name="cloud-offline" size={14} color={colors.card} />
          <Text style={styles.text} numberOfLines={1}>
            {t('common.offline')}
          </Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    zIndex: 1000,
  },
  safe: { backgroundColor: '#1F2937' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  text: {
    ...typography.caption,
    color: colors.card,
    fontWeight: '600',
  },
});
