"use client"

import Link from "next/link"
import { ArrowRight, QrCode, Sparkles, BarChart3, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp } from "@/lib/animations"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-4 py-20 md:py-32"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            variants={fadeInUp}
          >
            <Sparkles className="h-4 w-4" />
            Modern Loyalty Made Simple
          </motion.div>
          <motion.h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl" variants={fadeInUp}>
            Digital Stamp Cards for Your Business
          </motion.h1>
          <motion.p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl" variants={fadeInUp}>
            Replace physical punch cards with a seamless digital experience. Increase customer engagement, track
            progress in real-time, and grow your loyalty program effortlessly.
          </motion.p>
          <motion.div className="flex flex-col items-center justify-center gap-4 sm:flex-row" variants={fadeInUp}>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/cards">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  My Cards
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything you need to run a loyalty program</h2>
            <p className="text-lg text-muted-foreground">Simple, powerful, and built for modern businesses</p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: QrCode,
                title: "QR Code Scanning",
                description:
                  "Customers scan your unique QR code to collect stamps instantly. No app download required.",
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description:
                  "Works perfectly on any device. Customers can add your card to their home screen as a PWA.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Track customer engagement, stamps given, and rewards redeemed with beautiful dashboards.",
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="flex flex-col items-start gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to modernize your loyalty program</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step * 0.1 }}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {step === 1 ? "Create Your Card" : step === 2 ? "Display QR Code" : "Customers Scan"}
                </h3>
                <p className="text-muted-foreground">
                  {step === 1
                    ? "Set up your digital stamp card with custom rewards and stamp count"
                    : step === 2
                      ? "Print or display your unique QR code at your counter"
                      : "Customers scan to collect stamps and earn rewards automatically"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to go digital?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join modern businesses using Stampify to build customer loyalty
            </p>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2">
                  Start For Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      <PWAInstallPrompt />
    </div>
  )
}
