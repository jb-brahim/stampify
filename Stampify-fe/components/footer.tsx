import Link from "next/link"
import { Stamp } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Stamp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Stampify</span>
            </div>
            <p className="text-sm text-muted-foreground">Digital stamp cards for modern businesses</p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Product</h3>
            <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground">
              Demo
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Company</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Stampify. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
