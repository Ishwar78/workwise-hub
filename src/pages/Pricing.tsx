import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 } as const,
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "14 days",
    users: "Up to 5 users",
    features: ["12 screenshots/hr", "Time tracking", "Basic reports", "1 month storage", "Email support"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    users: "Up to 10 users",
    features: ["12 screenshots/hr", "Time tracking", "Full reports", "3 months storage", "URL tracking", "Priority support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    users: "Up to 25 users",
    features: ["12 screenshots/hr", "Time tracking", "Full reports", "3 months storage", "URL & app tracking", "Idle detection", "PDF/CSV export", "Sub-admin roles"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Team",
    price: "$199",
    period: "/month",
    users: "Up to 50 users",
    features: ["12 screenshots/hr", "All Pro features", "3 months storage", "Advanced analytics", "API access", "Dedicated support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    users: "100+ users",
    features: ["Custom screenshot rate", "Unlimited storage", "All features", "On-premise option", "SLA guarantee", "Account manager"],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" animate="visible" className="text-center mb-14">
            <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold mb-4">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
              Choose the plan that fits your team. Upgrade or downgrade anytime.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-xl p-6 border transition-all duration-300 hover:shadow-glow ${
                  plan.popular
                    ? "border-primary bg-gradient-card shadow-glow"
                    : "border-border bg-gradient-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-primary mb-4">{plan.users}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button
                    className="w-full gap-1"
                    variant={plan.popular ? "default" : "outline"}
                    size="sm"
                  >
                    {plan.cta} <ArrowRight size={14} />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
