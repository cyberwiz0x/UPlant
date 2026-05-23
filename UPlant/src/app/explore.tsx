import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlantAnalysis } from '@/lib/mock-analysis';
import { useLatestScan } from '@/lib/scan-store';
import {
  CareTimeline,
  TimelineScan,
  TimelineTask,
  deleteCareTimeline,
  renameCareTimeline,
  useCareTimelines,
} from '@/lib/timeline-store';

export default function CareScreen() {
  const latestScan = useLatestScan();
  const timelines = useCareTimelines();
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const selectedTimeline = timelines.find((timeline) => timeline.id === selectedTimelineId) ?? null;

  if (selectedTimeline) {
    return <TimelineDashboard timeline={selectedTimeline} onBack={() => setSelectedTimelineId(null)} />;
  }

  if (timelines.length > 0) {
    return <PlantList timelines={timelines} onSelectTimeline={setSelectedTimelineId} />;
  }

  if (latestScan) {
    return <SingleScanCare analysis={latestScan.analysis} photoUri={latestScan.photoUri} />;
  }

  return (
    <ScrollView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Care</Text>
          <Text style={styles.title}>No named plants yet</Text>
          <Text style={styles.body}>
            Scan a plant, then create a new care timeline to save progress photos and care tasks.
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

function PlantList({
  timelines,
  onSelectTimeline,
}: {
  timelines: CareTimeline[];
  onSelectTimeline: (timelineId: string) => void;
}) {
  return (
    <ScrollView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Care</Text>
          <Text style={styles.title}>Tracked plants</Text>
          <Text style={styles.body}>Tap a plant to view care tasks and timeline.</Text>
        </View>

        <View style={styles.plantList}>
          {timelines.map((timeline) => (
            <PlantCard key={timeline.id} timeline={timeline} onPress={() => onSelectTimeline(timeline.id)} />
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

function PlantCard({ timeline, onPress }: { timeline: CareTimeline; onPress: () => void }) {
  const latestScan = timeline.scans[0];

  return (
    <Pressable style={styles.plantCard} onPress={onPress}>
      {latestScan ? (
        <Image source={{ uri: latestScan.photoUri }} style={styles.plantThumbnail} />
      ) : (
        <View style={styles.placeholderThumb}>
          <Ionicons name="image-outline" color="#7A877D" size={24} />
        </View>
      )}
      <View style={styles.plantCardCopy}>
        <Text style={styles.plantName}>{timeline.nickname}</Text>
        <Text style={styles.plantSpecies}>{timeline.species}</Text>
        <Text style={styles.scanCount}>{timeline.scans.length} saved scans</Text>
        {latestScan && <Text style={styles.latestStatus}>{latestScan.condition}</Text>}
      </View>
      <Ionicons name="chevron-forward" color="#7A877D" size={20} />
    </Pressable>
  );
}

function TimelineDashboard({ timeline, onBack }: { timeline: CareTimeline; onBack: () => void }) {
  const latestScan = timeline.scans[0];
  const [draftName, setDraftName] = useState(timeline.nickname);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const shouldShowDiagnostics = latestScan ? isUnhealthyScan(latestScan) : false;

  async function handleSaveName() {
    const renamedTimeline = await renameCareTimeline(timeline.id, draftName);
    if (renamedTimeline) {
      setDraftName(renamedTimeline.nickname);
      setSaveMessage('Name updated.');
      setIsEditing(false);
    }
  }

  function handleDelete() {
    Alert.alert('Delete plant?', `Remove ${timeline.nickname} and its saved scans from this demo?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCareTimeline(timeline.id);
          onBack();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.detailNav}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" color="#1F7A4D" size={20} />
            <Text style={styles.backText}>All plants</Text>
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              setDraftName(timeline.nickname);
              setSaveMessage(null);
              setIsEditing((current) => !current);
            }}
            accessibilityLabel="Edit plant">
            <Ionicons name={isEditing ? 'close' : 'create-outline'} color="#1F7A4D" size={21} />
          </Pressable>
        </View>

        {latestScan && <Image source={{ uri: latestScan.photoUri }} style={styles.preview} />}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Monitoring</Text>
          {isEditing ? (
            <TextInput
              value={draftName}
              onChangeText={(value) => {
                setDraftName(value);
                setSaveMessage(null);
              }}
              placeholder="Plant name"
              placeholderTextColor="#7A877D"
              style={styles.nameInput}
            />
          ) : (
            <Text style={styles.title}>{timeline.nickname}</Text>
          )}
          <Text style={styles.body}>{timeline.species}</Text>
          {isEditing && (
            <View style={styles.detailActions}>
              <Pressable style={styles.saveButton} onPress={handleSaveName}>
                <Ionicons name="checkmark" color="#FFFFFF" size={18} />
                <Text style={styles.saveButtonText}>Save name</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" color="#A33A31" size={18} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          )}
          {saveMessage && <Text style={styles.successText}>{saveMessage}</Text>}
        </View>

        {latestScan && <TimelineStatus scan={latestScan} />}

        {latestScan && shouldShowDiagnostics && (
          <DiagnosticAssistant plantName={timeline.nickname} scan={latestScan} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care timeline</Text>
          {timeline.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo progress</Text>
          <View style={styles.progressGrid}>
            {timeline.scans.map((scan) => (
              <ScanProgressCard key={scan.id} scan={scan} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

type DiagnosticAnswers = {
  light?: string;
  pattern?: string;
  pests?: string;
  soil?: string;
};

const diagnosticQuestions = [
  {
    id: 'soil',
    title: 'How does the soil usually feel?',
    options: [
      { label: 'Wet often', value: 'wet' },
      { label: 'Dry quickly', value: 'dry' },
      { label: 'Balanced', value: 'balanced' },
    ],
  },
  {
    id: 'light',
    title: 'What light does it get?',
    options: [
      { label: 'Low light', value: 'low' },
      { label: 'Bright indirect', value: 'bright' },
      { label: 'Direct sun', value: 'direct' },
    ],
  },
  {
    id: 'pattern',
    title: 'Where is yellowing most visible?',
    options: [
      { label: 'Lower leaves', value: 'lower' },
      { label: 'New growth', value: 'new' },
      { label: 'Spots or patches', value: 'spots' },
    ],
  },
  {
    id: 'pests',
    title: 'Any pests, webbing, or sticky leaves?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unknown' },
    ],
  },
] as const;

function DiagnosticAssistant({ plantName, scan }: { plantName: string; scan: TimelineScan }) {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const explanation = getDiagnosticExplanation(answers, scan);
  const answeredCount = Object.keys(answers).length;

  return (
    <View style={styles.diagnosticCard}>
      <View style={styles.diagnosticHeader}>
        <View style={styles.diagnosticCopy}>
          <Text style={styles.cardLabel}>Yellowing check</Text>
          <Text style={styles.diagnosticTitle}>Find a likely cause</Text>
          <Text style={styles.body}>
            Answer quick care questions for a possible explanation for {plantName}.
          </Text>
        </View>
        <Pressable style={styles.diagnosticButton} onPress={() => setIsOpen((current) => !current)}>
          <Ionicons name={isOpen ? 'close' : 'help-buoy-outline'} color="#FFFFFF" size={18} />
          <Text style={styles.diagnosticButtonText}>{isOpen ? 'Close' : 'Diagnose'}</Text>
        </Pressable>
      </View>

      {isOpen && (
        <View style={styles.diagnosticBody}>
          {diagnosticQuestions.map((question) => (
            <View key={question.id} style={styles.questionBlock}>
              <Text style={styles.questionTitle}>{question.title}</Text>
              <View style={styles.answerChips}>
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.answerChip, selected && styles.answerChipSelected]}
                      onPress={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option.value,
                        }))
                      }>
                      <Text style={[styles.answerText, selected && styles.answerTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>
              {answeredCount === diagnosticQuestions.length ? 'Possible explanation' : 'Early read'}
            </Text>
            <Text style={styles.explanationTitle}>{explanation.title}</Text>
            <Text style={styles.body}>{explanation.detail}</Text>
            <Text style={styles.nextStepText}>{explanation.nextStep}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function getDiagnosticExplanation(answers: DiagnosticAnswers, scan: TimelineScan) {
  if (answers.pests === 'yes' || answers.pattern === 'spots') {
    return {
      title: 'Pest stress or leaf damage is possible',
      detail:
        'Spots, patchy yellowing, webbing, or sticky residue can point to pests or damaged tissue rather than a simple watering issue.',
      nextStep: 'Check leaf undersides closely, isolate the plant if pests are visible, and wipe leaves before rescanning.',
    };
  }

  if (answers.soil === 'wet') {
    return {
      title: 'Overwatering or poor drainage is likely',
      detail:
        'Yellowing leaves with soil that stays wet often means roots are not getting enough oxygen, especially for pothos and similar houseplants.',
      nextStep: 'Pause watering, confirm the pot drains, and water again only when the top soil dries.',
    };
  }

  if (answers.soil === 'dry') {
    return {
      title: 'Underwatering stress is possible',
      detail:
        'If soil dries out quickly, leaves can yellow as the plant sheds older growth or struggles to keep moisture consistent.',
      nextStep: 'Water thoroughly, let excess drain, and compare a progress photo after several days.',
    };
  }

  if (answers.light === 'direct') {
    return {
      title: 'Too much direct sun may be stressing leaves',
      detail:
        'Direct light can bleach or yellow indoor plant leaves, especially if the plant was previously kept in softer light.',
      nextStep: 'Move it to bright indirect light and track whether new yellowing slows.',
    };
  }

  if (answers.light === 'low') {
    return {
      title: 'Low light could be slowing growth',
      detail:
        'Lower leaves may yellow when a plant is not getting enough light to support all of its foliage.',
      nextStep: 'Move closer to a window with bright indirect light and avoid increasing watering at the same time.',
    };
  }

  if (answers.pattern === 'lower') {
    return {
      title: 'Older leaf shedding may be normal',
      detail:
        'If mostly lower older leaves are yellowing and the rest of the plant looks steady, it may be normal aging or a mild care imbalance.',
      nextStep: 'Remove fully yellow leaves and watch whether yellowing spreads to newer growth.',
    };
  }

  if (scan.condition === 'yellowing leaves') {
    return {
      title: 'Most common causes are water or light imbalance',
      detail:
        'Yellowing is a symptom with several possible causes. The care answers will narrow whether watering, drainage, light, or pests are more likely.',
      nextStep: 'Answer the questions above, then take another progress scan after the care change.',
    };
  }

  return {
    title: 'Care stress is possible',
    detail:
      'The latest scan is not marked healthy, so use the questions to narrow whether the issue looks like pests, water stress, or light stress.',
    nextStep: 'Inspect the leaves, stabilize watering and light, then save a follow-up scan to compare.',
  };
}

function isUnhealthyScan(scan: TimelineScan) {
  return scan.healthStatus !== 'healthy' || scan.condition !== 'healthy';
}

function SingleScanCare({ analysis, photoUri }: { analysis: PlantAnalysis; photoUri: string }) {
  const isHealthy = analysis.health.status === 'healthy';

  return (
    <ScrollView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Image source={{ uri: photoUri }} style={styles.preview} />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Latest scan</Text>
          <Text style={styles.title}>{analysis.plant.commonName}</Text>
          <Text style={styles.body}>{analysis.plant.scientificName}</Text>
          <Text style={styles.body}>
            Create a timeline from the Scan tab to monitor this plant over time.
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

function TimelineStatus({ scan }: { scan: TimelineScan }) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View>
          <Text style={styles.cardLabel}>Latest scan</Text>
          <Text style={styles.cardTitle}>{scan.healthStatus}</Text>
        </View>
        <View style={styles.confidencePill}>
          <Text style={styles.confidenceText}>{Math.round(scan.confidence * 100)}%</Text>
        </View>
      </View>
      <Text style={styles.body}>
        last scanned {formatScanDate(scan.scannedAt)}
      </Text>
    </View>
  );
}

function TaskRow({ task }: { task: TimelineTask }) {
  return (
    <View style={styles.taskRow}>
      <View style={styles.taskIcon}>
        <Ionicons name="checkmark-circle-outline" color="#1F7A4D" size={22} />
      </View>
      <View style={styles.taskCopy}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.dueText}>{task.dueLabel}</Text>
        </View>
        <Text style={styles.body}>{task.detail}</Text>
      </View>
    </View>
  );
}

function ScanProgressCard({ scan }: { scan: TimelineScan }) {
  return (
    <View style={styles.progressCard}>
      <Image source={{ uri: scan.photoUri }} style={styles.progressImage} />
      <View style={styles.progressCopy}>
        <Text style={styles.progressDate}>{formatScanDate(scan.scannedAt)}</Text>
        <Text style={styles.progressStatus}>{scan.condition}</Text>
      </View>
    </View>
  );
}

function formatScanDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
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
  nameInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D8E2D7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#102015',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 32,
    paddingHorizontal: 12,
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
  plantList: {
    gap: 12,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  plantThumbnail: {
    width: 76,
    height: 76,
    borderRadius: 8,
  },
  placeholderThumb: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EDF3EA',
  },
  plantCardCopy: {
    flex: 1,
    gap: 3,
  },
  plantName: {
    color: '#102015',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  plantSpecies: {
    color: '#536257',
    fontSize: 13,
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  scanCount: {
    color: '#1F7A4D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  latestStatus: {
    color: '#102015',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'capitalize',
  },
  detailNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
  },
  backText: {
    color: '#1F7A4D',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E2D7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    minHeight: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#1F7A4D',
    paddingHorizontal: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  deleteButton: {
    minHeight: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4B6B2',
    borderRadius: 8,
    backgroundColor: '#FFF8F7',
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#A33A31',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  successText: {
    color: '#1F7A4D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  statusCard: {
    gap: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  confidencePill: {
    borderRadius: 999,
    backgroundColor: '#E5F7E7',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confidenceText: {
    color: '#1F7A4D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  diagnosticCard: {
    gap: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  diagnosticCopy: {
    flex: 1,
    gap: 5,
  },
  diagnosticTitle: {
    color: '#102015',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
  },
  diagnosticButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: '#245B40',
    paddingHorizontal: 12,
  },
  diagnosticButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  diagnosticBody: {
    gap: 14,
  },
  questionBlock: {
    gap: 8,
  },
  questionTitle: {
    color: '#102015',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  answerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  answerChip: {
    borderWidth: 1,
    borderColor: '#D8E2D7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  answerChipSelected: {
    borderColor: '#1F7A4D',
    backgroundColor: '#E5F7E7',
  },
  answerText: {
    color: '#536257',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  answerTextSelected: {
    color: '#1F7A4D',
  },
  explanationCard: {
    gap: 7,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A017',
    borderRadius: 8,
    backgroundColor: '#FFF8E5',
    padding: 14,
  },
  explanationLabel: {
    color: '#7A5A0A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  explanationTitle: {
    color: '#102015',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
  },
  nextStepText: {
    color: '#5D4212',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 20,
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
  taskRow: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  taskIcon: {
    paddingTop: 2,
  },
  taskCopy: {
    flex: 1,
    gap: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    color: '#102015',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  dueText: {
    color: '#1F7A4D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  progressGrid: {
    gap: 12,
  },
  progressCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  progressImage: {
    width: 96,
    aspectRatio: 1,
  },
  progressCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    padding: 12,
  },
  progressDate: {
    color: '#1F7A4D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  progressStatus: {
    color: '#102015',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'capitalize',
  },
  body: {
    color: '#536257',
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 22,
  },
});
