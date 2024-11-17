import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen chat-gradient p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <h2>1. Terms</h2>
          <p>By accessing Jameea AI, you agree to be bound by these terms of service.</p>

          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily use Jameea AI for personal, non-commercial use only.</p>

          <h2>3. Disclaimer</h2>
          <p>The materials on Jameea AI are provided on an &apos;as is&apos; basis.</p>

          <h2>4. Limitations</h2>
          <p>Jameea AI shall not be held liable for any damages arising out of the use or inability to use our services.</p>

          <h2>5. Contact</h2>
          <p>For any questions regarding these terms, please contact us at ghazijohar@gmail.com</p>
        </CardContent>
      </Card>
    </div>
  );
}