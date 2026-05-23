import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLatestScan } from '@/lib/scan-store';

export default function CareScreen() {
  const latestScan = useLatestScan();

  if (!latestScan) {
    return (
      <ScrollView style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Care plan</Text>
            <Text style={styles.title}>No scan yet</Text>
            <Text style={styles.body}>
              Take a plant photo on the Scan tab. Care guidance and tracking notes will appear here
              after the plant is analyzed.
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    );
  }

  const { analysis, photoUri } = latestScan;
  const isHealthy = analysis.health.status === 'healthy';

  return (
    <ScrollView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Image source={{ uri: photoUri }} style={styles.preview} />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Analysis</Text>
          <Text style={styles.title}>{analysis.plant.commonName}</Text>
          <Text style={styles.body}>
            {analysis.plant.scientificName} - {Math.round(analysis.plant.confidence * 100)}% plant
            match
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.cardLabel}>Leaf health</Text>
          <Text style={styles.cardTitle}>{analysis.health.status}</Text>
          <Text style={styles.body}>
            {analysis.health.condition} - {Math.round(analysis.health.confidence * 100)}% confidence
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnosis</Text>
          <View style={styles.row}>
            <Text style={styles.body}>{analysis.care.diagnosis}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isHealthy ? 'Keep it up!' : 'How to fix'}</Text>
          {analysis.care.fixes.map((fix) => (
            <View key={fix} style={styles.row}>
              <Text style={styles.body}>{fix}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track this week</Text>
          {analysis.care.track.map((item) => (
            <View key={item} style={styles.rule}>
              <Text style={styles.body}>{item}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5FAF4',
  },
  safeArea: {
    gap: 20,
    padding: 20,
    paddingBottom: 96,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
  },
  header: {
    gap: 8,
    paddingTop: 10,
  },
  eyebrow: {
    color: '#1F7A4D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102015',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 36,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#102015',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  statusCard: {
    gap: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  cardLabel: {
    color: '#1F7A4D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#102015',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'capitalize',
  },
  row: {
    gap: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  rule: {
    gap: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#1F7A4D',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  body: {
    color: '#536257',
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 22,
  },
});
