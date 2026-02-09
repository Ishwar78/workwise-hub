import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Monitor, Apple, Terminal, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 } as const,
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const platforms = [
  { name: "Windows", icon: Monitor, version: "v2.1.0", size: "45 MB", ext: ".exe" },
  { name: "macOS", icon: Apple, version: "v2.1.0", size: "52 MB", ext: ".dmg" },
  { name: "Linux", icon: Terminal, version: "v2.1.0", size: "48 MB", ext: ".AppImage" },
];

const DownloadPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" animate="visible" className="text-center mb-14">
            <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold mb-4">
              Download <span className="text-gradient">WEBMOK Agent</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
              One installer for all companies. Login defines your company rules and plan settings.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                custom={i}
                className="rounded-xl bg-gradient-card border border-border p-8 text-center hover:border-primary/30 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <p.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{p.version} • {p.size}</p>
                <p className="text-xs text-muted-foreground mb-4">{p.ext}</p>
                <Button className="w-full gap-2">
                  <Download size={16} /> Download
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl bg-gradient-card border border-border p-6">
              <h3 className="font-semibold text-foreground mb-3">How it works</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">1.</span> Download & install for your OS</li>
                <li className="flex gap-3"><span className="text-primary font-bold">2.</span> Login with your company credentials</li>
                <li className="flex gap-3"><span className="text-primary font-bold">3.</span> Agent starts tracking automatically in background</li>
                <li className="flex gap-3"><span className="text-primary font-bold">4.</span> View activity data on the web dashboard</li>
              </ol>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DownloadPage;
