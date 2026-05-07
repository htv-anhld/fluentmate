import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function GrammarLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grammar lesson</Text>
      <Text style={styles.subtitle}>Lesson: {lessonId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '600' },
  subtitle: { marginTop: 8, opacity: 0.6 },
});
