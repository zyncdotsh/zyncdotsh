import Navbar from "@/components/Navbar";
import PrivacyDemo from "@/components/PrivacyDemo";

export default function EmblemPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-12">
        <PrivacyDemo />
      </main>
    </div>
  );
}
