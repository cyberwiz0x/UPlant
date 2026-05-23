import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyzePlantPhoto } from '@/lib/api';
import { PlantAnalysis } from '@/lib/mock-analysis';
import { setLatestScan } from '@/lib/scan-store';
import { CareTimeline, addScanToTimeline, createCareTimeline, useCareTimelines } from '@/lib/timeline-store';

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableLenses, setAvailableLenses] = useState<string[]>([]);
  const [selectedLens, setSelectedLens] = useState<string | undefined>('builtInWideAngleCamera');
  const [zoom, setZoom] = useState(0);
  const [plantNickname, setPlantNickname] = useState('');
  const [timelineMessage, setTimelineMessage] = useState<string | null>(null);
  const timelines = useCareTimelines();

  async function handleAnalyze() {
    if (!cameraRef.current || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setTimelineMessage(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75, base64: false });
      if (!photo?.uri) {
        throw new Error('Camera did not return a photo URI.');
      }
      setCapturedPhotoUri(photo.uri);
      const result = await analyzePlantPhoto(photo.uri);
      setAnalysis(result);
      setLatestScan({ analysis: result, photoUri: photo.uri });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleRetake() {
    setAnalysis(null);
    setCapturedPhotoUri(null);
    setError(null);
    setPlantNickname('');
    setTimelineMessage(null);
    setLatestScan(null);
  }

  async function handleCreateTimeline() {
    if (!analysis || !capturedPhotoUri) {
      return;
    }

    const timeline = await createCareTimeline(
      plantNickname || analysis.plant.commonName,
      analysis,
      capturedPhotoUri,
    );
    setTimelineMessage(`${timeline.nickname} is now being monitored.`);
  }

  async function handleAddToTimeline(timelineId: string) {
    if (!analysis || !capturedPhotoUri) {
      return;
    }

    const timeline = await addScanToTimeline(timelineId, analysis, capturedPhotoUri);
    if (timeline) {
      setTimelineMessage(`Saved this scan to ${timeline.nickname}.`);
    }
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1F7A4D" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionCopy}>
          <TextBlock variant="eyebrow">UPlant</TextBlock>
          <TextBlock variant="title">Camera access makes the demo real.</TextBlock>
          <TextBlock>
            Point your phone at a plant, capture a frame, then UPlant will identify the plant and
            check visible leaf health.
          </TextBlock>
        </View>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <TextBlock variant="button">Enable camera</TextBlock>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      {capturedPhotoUri ? (
        <Image source={{ uri: capturedPhotoUri }} style={styles.capturedImage} />
      ) : (
        <CameraView
          ref={cameraRef}
          facing="back"
          selectedLens={selectedLens}
          zoom={zoom}
          onAvailableLensesChanged={(event) => {
            const lenses = event.lenses;
            setAvailableLenses(lenses);
            if (!selectedLens || !lenses.includes(selectedLens)) {
              setSelectedLens(lenses.includes('builtInWideAngleCamera') ? 'builtInWideAngleCamera' : lenses[0]);
            }
          }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.scrim} />

      <SafeAreaView style={styles.overlay}>
        {!capturedPhotoUri && (
          <View style={styles.header}>
            <TextBlock variant="eyebrow">Plant Analysis</TextBlock>
            <TextBlock variant="title">Frame a leaf clearly.</TextBlock>
          </View>
        )}

        {!capturedPhotoUri && (
          <View style={styles.cameraControlsArea}>
            <View style={styles.focusGuide}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>

            <CameraControls
              availableLenses={availableLenses}
              selectedLens={selectedLens}
              zoom={zoom}
              onSelectLens={setSelectedLens}
              onSelectZoom={setZoom}
            />
          </View>
        )}

        <View style={styles.bottomPanel}>
          {isAnalyzing ? (
            <AnalyzingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : analysis ? (
            <AnalysisResult analysis={analysis} />
          ) : (
            <ScanPrompt />
          )}

          {analysis && capturedPhotoUri && (
            <TimelineCreator
              nickname={plantNickname}
              message={timelineMessage}
              timelines={timelines}
              onAddToTimeline={handleAddToTimeline}
              onChangeNickname={setPlantNickname}
              onCreateTimeline={handleCreateTimeline}
            />
          )}

          {isAnalyzing ? null : capturedPhotoUri ? (
            <Pressable style={styles.secondaryButton} onPress={handleRetake}>
              <TextBlock variant="secondaryButtonText">Take another photo</TextBlock>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.primaryButton, isAnalyzing && styles.disabledButton]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}>
              {isAnalyzing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <TextBlock variant="button">Take photo</TextBlock>
              )}
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function TimelineCreator({
  nickname,
  message,
  timelines,
  onAddToTimeline,
  onChangeNickname,
  onCreateTimeline,
}: {
  nickname: string;
  message: string | null;
  timelines: CareTimeline[];
  onAddToTimeline: (timelineId: string) => void;
  onChangeNickname: (value: string) => void;
  onCreateTimeline: () => void;
}) {
  const [isCreatingTimeline, setIsCreatingTimeline] = useState(false);
  const [isChoosingPlant, setIsChoosingPlant] = useState(false);

  return (
    <View style={styles.timelineCreator}>
      <Pressable
        style={styles.timelineButton}
        onPress={() => setIsCreatingTimeline((current) => !current)}>
        <Ionicons name="calendar-outline" color="#FFFFFF" size={18} />
        <TextBlock variant="button">Create new plant</TextBlock>
      </Pressable>

      {isCreatingTimeline && (
        <View style={styles.timelineForm}>
          <TextInput
            value={nickname}
            onChangeText={onChangeNickname}
            placeholder="Name this plant"
            placeholderTextColor="#7A877D"
            style={styles.nicknameInput}
          />
          <Pressable
            style={styles.timelineConfirmButton}
            onPress={() => {
              onCreateTimeline();
              setIsCreatingTimeline(false);
            }}>
            <TextBlock variant="button">Start monitoring</TextBlock>
          </Pressable>
        </View>
      )}

      {timelines.length > 0 ? (
        <Pressable
          style={styles.timelineSecondaryButton}
          onPress={() => setIsChoosingPlant((current) => !current)}>
          <Ionicons name="albums-outline" color="#1F7A4D" size={18} />
          <TextBlock variant="timelineSecondaryText">Add to existing plant</TextBlock>
        </Pressable>
      ) : null}

      {isChoosingPlant && (
        <View style={styles.plantPicker}>
          {timelines.map((timeline) => (
            <Pressable
              key={timeline.id}
              style={styles.plantPickerItem}
              onPress={() => {
                onAddToTimeline(timeline.id);
                setIsChoosingPlant(false);
              }}>
              <View style={styles.plantPickerCopy}>
                <Text style={styles.plantPickerTitle}>{timeline.nickname}</Text>
                <Text style={styles.plantPickerMeta}>{timeline.scans.length} saved scans</Text>
              </View>
              <Ionicons name="chevron-forward" color="#7A877D" size={18} />
            </Pressable>
          ))}
        </View>
      )}

      {message && <TextBlock variant="successText">{message}</TextBlock>}
    </View>
  );
}

function CameraControls({
  availableLenses,
  selectedLens,
  zoom,
  onSelectLens,
  onSelectZoom,
}: {
  availableLenses: string[];
  selectedLens?: string;
  zoom: number;
  onSelectLens: (lens: string) => void;
  onSelectZoom: (zoom: number) => void;
}) {
  const visibleLenses = availableLenses.filter((lens) =>
    ['builtInUltraWideCamera', 'builtInWideAngleCamera', 'builtInTelephotoCamera'].includes(lens),
  );

  return (
    <View style={styles.cameraControls}>
      {visibleLenses.length > 1 && (
        <View style={styles.controlGroup}>
          {visibleLenses.map((lens) => (
            <Pressable
              key={lens}
              style={[styles.controlChip, selectedLens === lens && styles.controlChipSelected]}
              onPress={() => onSelectLens(lens)}>
              <Text style={[styles.controlText, selectedLens === lens && styles.controlTextSelected]}>
                {getLensLabel(lens)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.controlGroup}>
        {[
          { label: '1x', value: 0 },
          { label: '1.5x', value: 0.16 },
          { label: '2x', value: 0.28 },
        ].map((option) => (
          <Pressable
            key={option.label}
            style={[styles.controlChip, zoom === option.value && styles.controlChipSelected]}
            onPress={() => onSelectZoom(option.value)}>
            <Text style={[styles.controlText, zoom === option.value && styles.controlTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function getLensLabel(lens: string) {
  if (lens.includes('UltraWide')) {
    return '0.5x';
  }
  if (lens.includes('Telephoto')) {
    return '2x';
  }
  return '1x';
}

function AnalyzingState() {
  return (
    <View style={styles.analyzing}>
      <ActivityIndicator color="#1F7A4D" />
      <View style={styles.prompt}>
        <TextBlock variant="sectionTitle">Analyzing</TextBlock>
        <TextBlock>Identifying plant and leaf health.</TextBlock>
      </View>
    </View>
  );
}

function ScanPrompt() {
  return (
    <View style={styles.prompt}>
      <TextBlock variant="sectionTitle">Plant Photo Analysis</TextBlock>
      <TextBlock>
        Place plant in frame and take a photo for identification and care guidance.
      </TextBlock>
    </View>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.prompt}>
      <TextBlock variant="sectionTitle">Could not analyze yet</TextBlock>
      <TextBlock>{message}</TextBlock>
      <TextBlock variant="muted">Make sure the backend is running on your laptop.</TextBlock>
    </View>
  );
}

function AnalysisResult({ analysis }: { analysis: PlantAnalysis }) {
  return (
    <View style={styles.resultContent}>
      <View style={styles.resultHeader}>
        <TextBlock variant="sectionTitle">{analysis.plant.commonName}</TextBlock>
        <TextBlock variant="muted">{analysis.plant.scientificName}</TextBlock>
      </View>

      <View style={styles.statusRow}>
        <TextBlock variant="pill">{analysis.health.status}</TextBlock>
        <TextBlock variant="muted">{Math.round(analysis.health.confidence * 100)}% confidence</TextBlock>
      </View>

      <TextBlock variant="muted">Open the Care tab for fixes and what to track.</TextBlock>
    </View>
  );
}

function TextBlock({
  children,
  variant = 'body',
}: {
  children: React.ReactNode;
  variant?:
    | 'body'
    | 'button'
    | 'eyebrow'
    | 'muted'
    | 'overlayBody'
    | 'pill'
    | 'sectionTitle'
    | 'secondaryButtonText'
    | 'successText'
    | 'timelineSecondaryText'
    | 'title';
}) {
  const textStyle = [styles.text, styles[variant]];
  return (
    <View style={variant === 'pill' ? styles.pillWrap : undefined}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07130D',
  },
  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FAF4',
  },
  permissionScreen: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#F5FAF4',
  },
  permissionCopy: {
    gap: 12,
    paddingTop: 64,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(2, 12, 7, 0.28)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    gap: 8,
    paddingTop: 8,
  },
  focusGuide: {
    alignSelf: 'center',
    width: '74%',
    maxWidth: 340,
    aspectRatio: 0.78,
  },
  cameraControlsArea: {
    alignItems: 'center',
    gap: 18,
  },
  cameraControls: {
    alignItems: 'center',
    gap: 10,
  },
  controlGroup: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(7, 19, 13, 0.58)',
    padding: 6,
  },
  controlChip: {
    minWidth: 54,
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  controlChipSelected: {
    backgroundColor: '#F5FAF4',
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  controlTextSelected: {
    color: '#102015',
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: '#D9F99D',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  bottomPanel: {
    gap: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(250, 255, 248, 0.94)',
  },
  timelineCreator: {
    gap: 10,
  },
  timelineForm: {
    gap: 10,
  },
  nicknameInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#D8E2D7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#102015',
    fontSize: 15,
    paddingHorizontal: 12,
  },
  timelineButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#245B40',
    paddingHorizontal: 16,
  },
  timelineConfirmButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1F7A4D',
    paddingHorizontal: 16,
  },
  timelineSecondaryButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F7A4D',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  plantPicker: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8E2D7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  plantPickerItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF1EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  plantPickerCopy: {
    flex: 1,
    gap: 2,
  },
  plantPickerTitle: {
    color: '#102015',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  plantPickerMeta: {
    color: '#536257',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  prompt: {
    gap: 8,
  },
  analyzing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultContent: {
    gap: 10,
  },
  resultHeader: {
    gap: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1F7A4D',
    paddingHorizontal: 18,
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F7A4D',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },
  text: {
    color: '#142116',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
  },
  body: {
    color: '#142116',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  eyebrow: {
    color: '#D9F99D',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#102015',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },
  muted: {
    color: '#536257',
    fontSize: 13,
    lineHeight: 18,
  },
  overlayBody: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#1F7A4D',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  timelineSecondaryText: {
    color: '#1F7A4D',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  successText: {
    color: '#1F7A4D',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  pillWrap: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FFE8A3',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pill: {
    color: '#5D4212',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
