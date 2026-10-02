import ContactForm from '@/components/sections/contact/ContractForm';
import VisitOurOffices from '@/components/sections/about/VisitOurOffices';
import InstagramMarquee from '@/components/sections/home/InstagramMarquee';
import FAQ from '../../../components/sections/about/FAQ';

export default function ContactPage() {
  return (
    <main>
      <ContactForm />
      <VisitOurOffices />
      <InstagramMarquee />
      <FAQ />
    </main>
  );
}
