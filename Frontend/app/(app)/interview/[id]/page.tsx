import { LiveInterview } from '@/components/interview/live';
export default function Interview({ params }: { params: { id: string } }) {
  return <LiveInterview id={params.id} />;
}
