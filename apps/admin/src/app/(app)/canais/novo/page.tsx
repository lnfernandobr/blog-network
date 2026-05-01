import { ChannelForm } from '@/components/ChannelForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewChannelPage() {
  return (
    <>
      <PageHeader title="Novo canal" description="Cadastre um novo blog de nicho." />
      <ChannelForm />
    </>
  );
}
