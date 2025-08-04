import React from 'react';

const termsConditionsContent = `
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms and Conditions</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: August 4, 2025</p>
    <h3 class="text-xl font-bold mb-3">1. Accounts</h3>
    <p>When you create an account with us, you guarantee that you are above the age of 18 and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
    <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
    <h3 class="text-xl font-bold mb-3">2. Services Description</h3>
    <p>Metapresence provides an AI Digital Twin platform that enables users to create and deploy interactive, hyper-realistic AI avatars. Our Service allows you to:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li>Build and customize AI Digital Twins.</li>
        <li>Upload and integrate specialized knowledge bases to train your AI.</li>
        <li>Engage in conversational interactions with end-users via your AI Digital Twin.</li>
        <li>(Add any other core features specific to Metapresence, e.g., analytics, integrations)</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">3. User Responsibilities & Prohibited Uses</h3>
    <p>You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service. Specifically, you agree not to:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Provide Unlawful Content:</strong> Upload, transmit, or otherwise provide any content for your AI's knowledge base or through your use of the Service that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
        <li><strong>Impersonation:</strong> Use the Service to impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
        <li><strong>Intellectual Property Infringement:</strong> Upload or use any content (including but not limited to text, images, audio, or video for your AI's appearance or knowledge base) that you do not have the legal right to use or that infringes on the intellectual property rights (copyright, trademark, patent, trade secret) of others.</li>
        <li><strong>Malicious Use:</strong> Transmit any viruses, worms, defects, Trojan horses, or any items of a destructive nature.</li>
        <li><strong>Data Misuse:</strong> Collect or store personal data about other users without their express consent.</li>
        <li><strong>Spamming/Harassment:</strong> Use the AI Digital Twin for unsolicited commercial communication ("spam") or for any form of harassment, intimidation, or bullying.</li>
        <li><strong>Violation of Laws:</strong> Use the Service in any manner that violates any applicable local, national, or international law or regulation.</li>
        <li><strong>Circumvention:</strong> Attempt to interfere with, bypass, or disrupt the integrity or performance of the Service or its related systems or networks.</li>
    </ul>
    <p>We reserve the right to remove any content or terminate accounts that violate these Prohibited Uses without prior notice.</p>
    <h3 class="text-xl font-bold mb-3">4. Intellectual Property</h3>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Your Content:</strong> You retain ownership of any content, including knowledge base data, text, images, and audio/video you upload or create using the Service ("Your Content"). By providing Your Content, you grant Metapresence a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display Your Content solely for the purpose of operating, improving, and providing the Service to you.</li>
        <li><strong>Service Intellectual Property:</strong> The Service and its original content (excluding Your Content), features, and functionality are and will remain the exclusive property of Metapresence and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Metapresence.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">5. Fees and Payment</h3>
    <p>Access to certain features of the Service may require a paid subscription. Details of subscription plans, pricing, and features are available on our website.</p>
    <p>By subscribing to a paid plan, you agree to pay Metapresence the specified fees. All fees are in [Your Currency, e.g., MYR/USD] and are non-refundable unless otherwise stated in your specific agreement or by law.</p>
    <p>Payments are billed in advance on a [e.g., monthly, annual] recurring basis. Your subscription will automatically renew unless you cancel it before the end of the current billing period.</p>
    <p>Metapresence reserves the right to change its fees at any time, upon reasonable prior notice posted on our website or sent to you via email.</p>
    <h3 class="text-xl font-bold mb-3">6. Disclaimer of Warranties</h3>
    <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
    <p>Metapresence does not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>
    <h3 class="text-xl font-bold mb-3">7. Limitation of Liability</h3>
    <p>In no event shall Metapresence, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
    <h3 class="text-xl font-bold mb-3">8. Indemnification</h3>
    <p>You agree to defend, indemnify, and hold harmless Metapresence and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms; or c) content posted by you on the Service.</p>
    <h3 class="text-xl font-bold mb-3">9. Termination</h3>
    <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
    <p>If you wish to terminate your account, you may simply discontinue using the Service or contact us to formally close your account.</p>
    <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
    <h3 class="text-xl font-bold mb-3">10. Governing Law</h3>
    <p>These Terms shall be governed and construed in accordance with the laws of [Your Country/State, e.g., Malaysia], without regard to its conflict of law provisions.</p>
    <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service.</p>
    <h3 class="text-xl font-bold mb-3">11. Changes to These Terms</h3>
    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
    <p>By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>
    <h3 class="text-xl font-bold mb-3">12. Contact Us</h3>
    <p>If you have any questions about these Terms, please contact us:</p>
    <ul class="list-disc list-inside space-y-1">
        <li>By email: support@metapresence.my</li>
        <li>By visiting this page on our website: <a href="https://metapresence.my/contact" class="text-purple-500 hover:underline" target="_blank" rel="noopener noreferrer">metapresence.my/contact</a></li>
    </ul>
    `;

const TermsConditionsPage = () => {
  return (
    <div className="container mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md my-8 text-gray-800 dark:text-gray-200">
      <div dangerouslySetInnerHTML={{ __html: termsConditionsContent }} />
    </div>
  );
};

export default TermsConditionsPage;
