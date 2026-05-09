import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { MascotCircle } from '@/components/onboarding/MascotCircle';
import {
  signInWithEmail,
  signInWithStoredCred,
  getStoredEmail,
  forgetDevice,
} from '@/services/authService';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { supabase } from '@/services/supabase';
import { queryClient } from '@/services/queryClient';
import { colors, radius, spacing, typography } from '@/constants/theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const onboardingEmail = useOnboardingStore((s) => s.email);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setProfile = useUserStore((s) => s.setProfile);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const storedEmail = getStoredEmail();
  const [email, setEmail] = useState(storedEmail ?? onboardingEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const afterLogin = async () => {
    // Pull profile from public.users to restore name/level/etc.
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (uid) {
      const { data: profile } = await supabase
        .from('users')
        .select('email, name, level, daily_goal_minutes, coach_personality, industry, interests')
        .eq('id', uid)
        .maybeSingle();
      if (profile) {
        setProfile({
          email: profile.email ?? undefined,
          name: profile.name ?? undefined,
          level: profile.level ?? undefined,
          industry: profile.industry ?? undefined,
          interests: (profile.interests as string[] | null) ?? undefined,
          goalMinutesPerDay: profile.daily_goal_minutes ?? undefined,
          coachId: profile.coach_personality ?? undefined,
        });
      }
    }
    // Drop any cache populated under the previous (anon/old) session.
    queryClient.removeQueries();
    completeOnboarding();
    router.replace('/(tabs)/today');
  };

  const handleSignIn = async () => {
    const e = email.trim();
    if (!EMAIL_RE.test(e)) {
      Alert.alert(t('login.errorTitle'), t('login.errorEmailInvalid'));
      return;
    }
    if (!password) {
      // Empty password — try stored cred first (works if email matches stored)
      if (storedEmail && storedEmail === e) {
        setLoading(true);
        const session = await signInWithStoredCred().catch(() => null);
        setLoading(false);
        if (session) {
          await afterLogin();
          return;
        }
      }
      Alert.alert(t('login.errorTitle'), t('login.errorPasswordRequired'));
      return;
    }
    setLoading(true);
    try {
      const session = await signInWithEmail(e, password);
      if (!session) throw new Error('No session');
      await afterLogin();
    } catch (err) {
      Alert.alert(
        t('login.errorTitle'),
        err instanceof Error ? err.message : t('login.errorGeneric'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    Alert.alert(
      t('login.switchTitle'),
      t('login.switchBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('login.switchConfirm'),
          style: 'destructive',
          onPress: async () => {
            await forgetDevice().catch(() => {});
            resetOnboarding();
            router.replace('/(auth)/onboarding/welcome');
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={[colors.blue, colors.blueDark]} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            <Animated.View
              entering={FadeInDown.delay(80).springify()}
              style={styles.hero}
            >
              <MascotCircle size={96} bg="rgba(255,255,255,0.95)" />
              <Text style={styles.brand}>FluentMate</Text>
              <Text style={styles.subtitle}>{t('login.welcomeBack')}</Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(180).springify()}
              style={styles.form}
            >
              <Text style={styles.label}>{t('login.emailLabel')}</Text>
              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color={colors.muted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <Text style={[styles.label, { marginTop: spacing.md }]}>
                {t('login.passwordLabel')}
              </Text>
              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={
                    storedEmail && storedEmail === email
                      ? t('login.passwordOptional')
                      : t('login.passwordPlaceholder')
                  }
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              </View>

              {storedEmail && storedEmail === email ? (
                <Text style={styles.helper}>{t('login.passwordHelper')}</Text>
              ) : null}

              <Pressable
                onPress={handleSignIn}
                disabled={loading}
                style={({ pressed }) => [
                  styles.cta,
                  pressed && { opacity: 0.85 },
                  loading && { opacity: 0.6 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.blueDark} />
                ) : (
                  <Text style={styles.ctaText}>{t('login.signIn')}</Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleSwitchAccount}
                style={styles.altBtn}
                hitSlop={6}
              >
                <Text style={styles.altText}>{t('login.useDifferent')}</Text>
              </Pressable>
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(300)}
              style={styles.footer}
            >
              {t('login.noAccount')}{' '}
              <Text
                style={styles.link}
                onPress={() => router.replace('/(auth)/onboarding/welcome')}
              >
                {t('login.signUp')}
              </Text>
            </Animated.Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', gap: spacing.sm },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.card,
    fontStyle: 'italic',
    letterSpacing: -1,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  form: { gap: spacing.xs },
  label: {
    ...typography.micro,
    color: colors.card,
    opacity: 0.8,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.ink,
  },
  helper: {
    ...typography.small,
    fontSize: 12,
    color: colors.card,
    opacity: 0.85,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  cta: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: { ...typography.h2, color: colors.blueDark },
  altBtn: { alignItems: 'center', paddingVertical: spacing.md },
  altText: {
    ...typography.small,
    color: colors.card,
    opacity: 0.85,
    textDecorationLine: 'underline',
  },
  footer: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  link: {
    color: colors.card,
    fontWeight: '800',
    textDecorationLine: 'underline',
    opacity: 1,
  },
});
