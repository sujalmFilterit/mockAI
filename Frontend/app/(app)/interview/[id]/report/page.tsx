import { ReportView } from '@/components/report/report';
export default function Report({ params }: { params: { id: string } }) {
  return <ReportView id={params.id} />;
}
