import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-medical">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                ENAMEL <span className="text-primary">ROADS</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium medical education platform for dental and general medicine students and professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-primary">Student Login</Link></li>
              <li><Link href="/tutor/login" className="hover:text-primary">Tutor Portal</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ENAMEL ROADS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
