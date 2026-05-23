import { PlantAnalysis } from './mock-analysis';
import { API_BASE_URL } from '@/config.local';

export async function analyzePlantPhoto(photoUri: string): Promise<PlantAnalysis> {
  const formData = new FormData();
  formData.append('image', {
    uri: photoUri,
    name: 'plant-scan.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analyze request failed: ${response.status}`);
  }

  return response.json();
}
