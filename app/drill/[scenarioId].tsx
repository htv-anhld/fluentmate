import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DrillScreen() {
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drill</Text>
      <Text style={styles.subtitle}>Scenario: {scenarioId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '600' },
  subtitle: { marginTop: 8, opacity: 0.6 },
});
