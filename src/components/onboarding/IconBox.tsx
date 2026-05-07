import { View, StyleSheet } from 'react-native';

type Props = {
  bg: string;
  size?: number;
  radius?: number;
  children: React.ReactNode;
};

export function IconBox({ bg, size = 48, radius: r = 12, children }: Props) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: r, backgroundColor: bg },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
