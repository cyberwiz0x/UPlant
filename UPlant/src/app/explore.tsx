import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MILESTONES = [
  {
    title: '1. Live capture',
    body: 'Expo Camera captures a leaf frame on the phone. The current screen already proves this flow.',
  },
  {
    title: '2. Plant identification API',
    body: 'Send the image to Plant.id or Pl@ntNet and normalize the response into common name, scientific name, and confidence.',
  },
  {
    title: '3. Indoor disease model',
    body: 'Train MobileNetV2 or EfficientNetB0 on the Kaggle indoor plant disease dataset, then serve the saved model from the backend.',
  },
  {
    title: '4. Care recommendations',
    body: 'Map model labels like healthy, yellowing, brown edges, and leaf spot to fixes and weekly tracking fields.',
  },
];

const CARE_RULES = [
  {
    condition: 'Yellowing',
    fixes: 'Reduce watering, check drainage, move to bright indirect light.',
  },
  {
    condition: 'Brown edges',
    fixes: 'Check watering consistency, reduce harsh sun, increase humidity.',
  },
  {
    condition: 'Leaf spots',
    fixes: 'Remove badly affected leaves, avoid wet foliage, improve airflow.',
  },
  {
    condition: 'Pest damage',
    fixes: 'Inspect undersides of leaves, isolate plant, wipe leaves, consider neem or insecticidal soap.',
  },
];

export default function CareScreen() {
  return (
    <ScrollView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Build plan</Text>
          <Text style={styles.title}>The demo pipeline</Text>
          <Text style={styles.body}>
            UPlant combines plant identification, leaf health ML, and simple care rules. This tab
            keeps the hackathon scope visible while we wire the real services.
          </Text>
        </View>

        <View style={styles.section}>
          {MILESTONES.map((item) => (
            <View key={item.title} style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starter care rules</Text>
          {CARE_RULES.map((rule) => (
            <View key={rule.condition} style={styles.rule}>
              <Text style={styles.rowTitle}>{rule.condition}</Text>
              <Text style={styles.body}>{rule.fixes}</Text>
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
    gap: 22,
    padding: 20,
    paddingBottom: 96,
  },
  header: {
    gap: 8,
    paddingTop: 20,
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
    gap: 12,
  },
  sectionTitle: {
    color: '#102015',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
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
  rowTitle: {
    color: '#102015',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  body: {
    color: '#536257',
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 22,
  },
});
