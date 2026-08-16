import Hero from '@/components/home/Hero';
import FeatureCards from '@/components/home/FeatureCards';
import Introduction from '@/components/home/Introduction';
import Team from '@/components/home/Team';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <Introduction />
      <Team />
    </>
  );
}
