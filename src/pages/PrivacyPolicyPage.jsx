import React from 'react';

const privacyPolicyContent = `
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: August 4, 2025</p>
    <h3 class="text-xl font-bold mb-3">1. Information We Collect</h3>
    <p>We may collect various types of information from and about you and your use of our Service, including:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Personal Information:</strong> Information that can be used to identify you directly or indirectly, such as your name, email address, contact details, or any other information you provide when you register for an account, interact with our support, or provide a specialized knowledge base for your AI Digital Twin.</li>
        <li><strong>Conversational Data:</strong> When your AI Digital Twin interacts with end-users, we collect and process the conversational data generated during these interactions. This includes text, audio, and potentially video (depending on the features you enable) of the conversations.</li>
        <li><strong>Knowledge Base Data:</strong> Information you upload or input to create and customize the specialized knowledge base for your AI Digital Twin. This data is essential for the AI to provide relevant and accurate responses.</li>
        <li><strong>Usage Data:</strong> Information about how you access and use the Service, such as your IP address, browser type, operating system, pages viewed, time spent on pages, and other diagnostic data.</li>
        <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">2. How We Use Your Information</h3>
    <p>We use the collected information for various purposes, including:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li>To Provide and Maintain the Service: Operating, maintaining, and providing all features of the Service, including facilitating the creation and operation of your AI Digital Twins.</li>
        <li>To Improve and Personalize the Service: Understanding how users interact with our Service and AI Digital Twins to enhance user experience, develop new features, and improve the accuracy and effectiveness of the AI. This includes analyzing conversational data to extract insights.</li>
        <li>To Manage Your Account: Registering you as a new user, managing your account, and providing customer support.</li>
        <li>To Communicate with You: Sending you service-related announcements, updates, security alerts, and support messages.</li>
        <li>For Analytics and Research: Performing data analysis, research, and trend analysis to understand usage patterns and optimize our Service.</li>
        <li>To Ensure Security: Detecting, preventing, and addressing technical issues, fraud, or other malicious activities.</li>
        <li>To Comply with Legal Obligations: Meeting our legal and regulatory requirements.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">3. How We Share Your Information</h3>
    <p>We may share your information in the following situations:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>With Service Providers:</strong> We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used. These third parties have access to your information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
        <li><strong>For Business Transfers:</strong> If Metapresence is involved in a merger, acquisition, or asset sale, your Personal Information may be transferred. We will provide notice before your Personal Information is transferred and becomes subject to a different Privacy Policy.</li>
        <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
        <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent.</li>
    </ul>
    <h3 class="text-xl font-bold mb-3">4. Data Security</h3>
    <p>The security of your data is important to us. We implement reasonable measures to protect your Personal Information from unauthorized access, use, alteration, and disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
    <h3 class="text-xl font-bold mb-3">5. Retention of Data</h3>
    <p>We will retain your Personal Information and other collected data only for as long as is necessary for the purposes set out in this Privacy Policy, including to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
    <h3 class="text-xl font-bold mb-3">6. Your Data Protection Rights</h3>
    <p>Depending on your location, you may have the following rights regarding your personal data:</p>
    <ul class="list-disc list-inside space-y-1 mb-4">
        <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
        <li><strong>Right to Rectification:</strong> Request that we correct any inaccurate or incomplete personal data.</li>
        <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request that we delete your personal data under certain conditions.</li>
        <li><strong>Right to Restrict Processing:</strong> Request that we restrict the processing of your personal data under certain conditions.</li>
        <li><strong>Right to Data Portability:</strong> Request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
        <li><strong>Right to Object:</strong> Object to our processing of your personal data under certain conditions.</li>
    </ul>
    <p>To exercise any of these rights, please contact us using the contact details provided below.</p>
    <h3 class="text-xl font-bold mb-3">7. Links to Other Websites</h3>
    <p>Our Service may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
    <h3 class="text-xl font-bold mb-3">8. Children's Privacy</h3>
    <p>Our Service is not intended for use by anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers.</p>
    <h3 class="text-xl font-bold mb-3">9. Changes to This Privacy Policy</h3>
    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
    `;

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md my-8 text-gray-800 dark:text-gray-200">
      <div dangerouslySetInnerHTML={{ __html: privacyPolicyContent }} />
    </div>
  );
};

export default PrivacyPolicyPage;
