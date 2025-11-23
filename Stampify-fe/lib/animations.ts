"use client"

// Framer Motion Animation Variants for Stampify
import type { Variants } from "framer-motion"

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
}

// Stagger children animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// Stamp punch animation - realistic hole punch effect
export const stampPunch: Variants = {
  initial: { scale: 0, rotate: -15 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
}

// Progress circle animation
export const progressCircle: Variants = {
  initial: { pathLength: 0 },
  animate: (progress: number) => ({
    pathLength: progress,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  }),
}

// Button press animation
export const buttonPress = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
}

// Card hover animation
export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
    transition: { duration: 0.2 },
  },
}

// Modal/Dialog animation
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
}

// Counter animation
export const counterVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

// Skeleton shimmer
export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 1.5,
      ease: "linear",
    },
  },
}

// QR Scanner success flash
export const scanSuccess: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: [0, 1, 1, 0],
    scale: [0.8, 1.1, 1.1, 1.2],
    transition: { duration: 0.8 },
  },
}

// List item entrance
export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

// Confetti trigger
export const confettiTrigger = async () => {
  const { default: confetti } = await import("canvas-confetti")

  const count = 200
  const defaults = {
    origin: { y: 0.7 },
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })

  fire(0.2, {
    spread: 60,
  })

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}
