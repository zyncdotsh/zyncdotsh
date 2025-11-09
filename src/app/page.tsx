import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-1 px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            privacy is not a feature, it's a fundamental right
          </h1>
          <p className="text-gray-600 mb-2 font-mono text-sm">
            <span className="font-bold text-orange-600">privacy-first</span> <span className="font-bold">ecosystem for the paranoid</span>
          </p>
          <p className="text-gray-500 mb-12 text-xs">
            an experiment by{" "}
            <a 
              href="https://www.linkedin.com/in/simba-masters-b03a20232/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Simba Masters
            </a>
          </p>
          
          {/* Ecosystem Tools */}
          <div className="mt-16">
            <p className="text-sm text-gray-500 mb-6 font-bold">ecosystem tools</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center justify-items-center">
              <ToolIcon name="emblem" label="emblem" link="/emblem" active />
              <ToolIcon name="shield" label="shield pool" />
              <ToolIcon name="circuit" label="zk circuits" />
              <ToolIcon name="vault" label="vault" />
              <ToolIcon name="relay" label="relayer" />
              <ToolIcon name="proof" label="proof gen" />
              <ToolIcon name="bridge" label="bridge" />
              <ToolIcon name="explorer" label="explorer" link="/explorer" active />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ToolIcon({ name, label, link, active }: { name: string; label: string; link?: string; active?: boolean }) {
  const iconContent = (
    <>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono text-xs border-2 ${
        active 
          ? 'bg-orange-600 text-white border-orange-600' 
          : 'bg-gray-200 text-gray-400 border-gray-300'
      }`}>
        {name[0].toUpperCase()}
      </div>
      <span className={`text-xs ${active ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
        {label}
      </span>
    </>
  );

  if (active && link) {
    return (
      <Link href={link} className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity">
        {iconContent}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 cursor-not-allowed opacity-50">
      {iconContent}
    </div>
  );
}
