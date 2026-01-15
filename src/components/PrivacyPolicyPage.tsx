import { ArrowLeft, BarChart3, Shield, Mail, MapPin, User } from 'lucide-react';
import kadoshIcon from '../kadosh-ai-icon.png';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Figtree', sans-serif;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Leaders Pulse StoryTeller
                </h1>
              </div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Privacy Policy</h2>
                    <p className="text-blue-100 mt-1">PDPA Compliance Statement</p>
                  </div>
                </div>
                <p className="text-blue-100 text-sm">
                  Last updated: January 2026
                </p>
              </div>

              <div className="px-8 py-10 space-y-8">
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Kadosh AI ("we", "our", or "us") is committed to protecting your personal data in accordance with the
                    Personal Data Protection Act 2010 (PDPA) of Malaysia. This Privacy Policy explains how we collect, use,
                    disclose, and protect your personal data when you use Leaders Pulse StoryTeller.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2. Data We Collect</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We collect and process the following types of personal data:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li><strong>Account Information:</strong> Name, email address, company name, and role</li>
                    <li><strong>Survey Data:</strong> Employee Net Promoter Score (eNPS) survey responses and related feedback</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our platform</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">3. Purpose of Data Processing</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Your personal data is processed for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li>To provide and maintain our services</li>
                    <li>To create and manage your account</li>
                    <li>To generate AI-powered insights and stories from your survey data</li>
                    <li>To improve and personalize your experience</li>
                    <li>To communicate with you about service updates and support</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">4. Data Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your personal data
                    against unauthorized access, alteration, disclosure, or destruction. This includes encryption,
                    secure data storage, and access controls. However, no method of transmission over the Internet
                    or electronic storage is 100% secure.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">5. Data Retention</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We retain your personal data only for as long as necessary to fulfill the purposes for which it was
                    collected, including to satisfy legal, accounting, or reporting requirements. When your data is no
                    longer required, it will be securely deleted or anonymized.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">6. Data Sharing and Disclosure</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We do not sell your personal data. We may share your data with:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (e.g., cloud hosting, AI processing)</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">7. Your Rights Under PDPA</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Under the Personal Data Protection Act 2010, you have the following rights:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li><strong>Right of Access:</strong> Request access to your personal data</li>
                    <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data</li>
                    <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent for data processing at any time</li>
                    <li><strong>Right to Prevent Processing:</strong> Request that we stop processing your data for specific purposes</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    To exercise any of these rights, please contact us using the details provided below.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform uses cookies and similar tracking technologies to enhance your experience.
                    You can control cookie settings through your browser preferences. Essential cookies required
                    for the platform to function cannot be disabled.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes
                    by posting the new policy on this page and updating the "Last updated" date. We encourage you
                    to review this policy periodically.
                  </p>
                </section>

                <section className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">10. Contact Us</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <img src={kadoshIcon} alt="Kadosh AI" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Kadosh AI</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href="mailto:asha@kadoshai.com" className="font-medium text-blue-600 hover:text-blue-700">
                          asha@kadoshai.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">Petaling Jaya, Malaysia</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data Protection Officer</p>
                        <p className="font-medium text-gray-900">Colin Benedict Raj</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Powered by</span>
                <a href="https://kadoshai.com/" target="_blank" rel="noreferrer">
                  <img src={kadoshIcon} alt="Kadosh AI" className="h-6 object-contain" />
                </a>
              </div>
              <p className="text-sm text-gray-500">
                2026 Leaders Pulse StoryTeller. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
