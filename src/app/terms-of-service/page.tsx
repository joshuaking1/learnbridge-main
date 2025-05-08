"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="mb-4">
              Welcome to LearnBridge. By using our service, you agree to these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LearnBridge, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily use LearnBridge for personal, educational, or classroom use, subject to the following restrictions:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The content must not be used for commercial purposes without permission</li>
              <li>No modifications may be made to the materials</li>
              <li>No unauthorized use of any intellectual property</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
            <p>
              To access certain features of LearnBridge, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Content</h2>
            <p>
              Users may submit content to LearnBridge. By submitting content, you grant LearnBridge a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with the service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Privacy</h2>
            <p>
              Your use of LearnBridge is also governed by our Privacy Policy, which can be found at <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Disclaimer</h2>
            <p>
              LearnBridge is provided "as is" without warranties of any kind, either expressed or implied. We do not warrant that the service will be uninterrupted or error-free.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Limitation of Liability</h2>
            <p>
              In no event shall LearnBridge be liable for any damages arising out of the use or inability to use the materials on LearnBridge's website.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of Ghana, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to Terms</h2>
            <p>
              LearnBridge reserves the right to modify these terms at any time. We will notify users of any changes by updating the date at the bottom of this page.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@learnbridgedu.com.
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
