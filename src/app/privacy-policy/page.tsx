"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="mb-4">
              At LearnBridge, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Create an account</li>
              <li>Use our services</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p>
              This information may include your name, email address, phone number, school information, and other details you choose to provide.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Sharing of Information</h2>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Service providers who perform services on our behalf</li>
              <li>Educational institutions you are affiliated with</li>
              <li>In response to legal process or government request</li>
              <li>To protect the rights and safety of LearnBridge and others</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Choices</h2>
            <p>
              You can access and update certain information about you from within your account settings. You may also request that we delete your account and information.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Children's Privacy</h2>
            <p>
              Our service is not directed to children under 13. If we learn we have collected personal information from a child under 13, we will delete that information.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@learnbridgedu.com.
            </p>

            <p className="mt-8 text-sm text-gray-500">
              Last updated: June 1, 2023
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
