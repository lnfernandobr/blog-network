import { CampaignForm } from '@/components/CampaignForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewCampaignPage() {
  return (
    <>
      <PageHeader title="New campaign" description="Configure a TikTok carousel automation." />
      <CampaignForm />
    </>
  );
}
