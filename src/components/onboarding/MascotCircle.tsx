import { Image, Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type Props = {
  size?: number;
  /** If provided, renders the emoji instead of the brand mascot image. */
  emoji?: string;
  bg?: string;
};

export function MascotCircle({ size = 100, emoji, bg }: Props) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg ?? colors.blueLight,
        },
      ]}
    >
      {emoji ? (
        <Text style={{ fontSize: size * 0.55, lineHeight: size * 0.7 }}>
          {emoji}
        </Text>
      ) : (
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../../assets/images/splash-icon.png')}
          style={{ width: size * 0.78, height: size * 0.78 }}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
