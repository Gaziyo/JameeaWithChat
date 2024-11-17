import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen chat-gradient p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <h2>Information Collection and Use</h2>
          <p>We collect information to provide better services to our users. This includes:</p>
          <ul>
            <li>Account information when you sign up</li>
            <li>Chat messages and interactions with our AI</li>
            <li>Documents and files you upload</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2>Data Storage</h2>
          <p>Your data is securely stored using Google Cloud Platform and Firebase services.</p>

          <h2>Data Protection</h2>
          <p>We implement security measures to protect your personal information.</p>

          <h2>Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us at ghazijohar@gmail.com</p>
        </CardContent>
      </Card>
    </div>
  );
}