export const common = {
  appName: "Servease",
  legal: {
    back: "Back",
    contactLabels: {
      email: "Email:",
      institution: "Institution:",
      city: "City:",
    },
    terms: {
      title: "TERMS AND CONDITIONS OF USE",
      subtitle: "Service Control and Contracting System",
      tagline: '"The Easiest way to find your solution"',
      version: "Version 1.0 | January 2026 | Tijuana, Baja California, Mexico",
      footer: "Servease © 2026 — All rights reserved.",
      sections: [
        {
          h: "1. Acceptance of Terms",
          c: [
            "By registering, accessing or using the Servease platform (hereinafter, 'the Platform'), you expressly, freely and knowingly accept these Terms and Conditions of Use (hereinafter, 'the Terms'). If you do not agree with any of the terms set forth herein, you must refrain from using the Platform.",
            "Use of the Platform implies full acceptance of these Terms, as well as the Servease Privacy Policy, which is an integral part of this document. Servease reserves the right to modify these Terms at any time, notifying changes at least 10 days in advance."
          ]
        },
        {
          h: "2. Service Description",
          c: [
            "Servease is a digital technology platform that acts as an intermediary between people who need to contract services and trades (hereinafter, 'Clients') and people who offer such services (hereinafter, 'Providers'). The Platform facilitates the contracting process through the following main functionalities:",
            ["Posting of service requests by Clients.", "Submission and sending of proposals by Providers.", "Direct negotiation tools (counteroffers) between both parties.", "Private communication channel (chat) activated after formal acceptance of the service.", "Geolocation system to connect users within the municipality of Tijuana, Baja California.", "Mutual rating and review system between Clients and Providers.", "Payment processing with monthly commission charged to the Provider for use of the Platform."],
            { b: true, v: "Servease is NOT an employment agency, does NOT guarantee the technical quality of the physical work performed, and does NOT establish any employment relationship between the Platform and the Providers. The Platform acts solely as a technological link between the parties." }
          ]
        },
        {
          h: "3. Registration and Account Types",
          c: [
            { sh: "3.1 Account types" },
            "Within the Platform there are two types of user roles:",
            ["Client: user who posts service requests, reviews proposals, accepts or rejects applications and makes payments. There is no age restriction to register as a Client.", "Provider: user who searches and applies to posted requests, sends proposals and counteroffers, and performs the agreed services. To activate the Provider role, the user must be over 18 years of age and have legal capacity to enter into contracts."],
            { sh: "3.2 Change of role to Provider" },
            "Any user registered as a Client may request activation of the Provider role within the Platform, provided they meet the age requirement (18 years or older). By requesting this role change, the user declares under their own responsibility that they meet this requirement.",
            { sh: "3.3 Account responsibility" },
            "The user is responsible for maintaining the confidentiality of their access credentials. Any activity carried out from their account will be deemed to have been carried out by the account holder. Any unauthorized use must be immediately reported to Servease. Servease reserves the right to suspend or cancel accounts that breach these Terms."
          ]
        },
        {
          h: "4. Contracting Process",
          c: [
            { sh: "4.1 Posting requests (Client)" },
            "The Client may create posts specifying: service title, description, category, location within the municipality of Tijuana, and estimated price. The Client is solely responsible for the truthfulness and accuracy of the published information.",
            { sh: "4.2 Application (Provider)" },
            "The Provider may apply to requests that match their profile and skills. Submitting an application does not guarantee acceptance by the Client.",
            { sh: "4.3 Counteroffers and negotiation" },
            "Both parties may make counteroffers to agree on the final price of the service. The agreed price is binding once both parties formally accept it within the Platform.",
            { sh: "4.4 Acceptance and rejection" },
            "The Client has the exclusive right to approve or reject received applications. Formal acceptance activates the chat channel between the parties to coordinate the logistical details of the service.",
            { sh: "4.5 Service execution and closure" },
            "Upon completion of the work, either party may mark the service as 'Completed'. Upon closure, both parties may rate each other with a score from 1 to 5. The chat will switch to read-only mode once the service is concluded."
          ]
        },
        {
          h: "5. Payments and Commissions",
          c: [
            { sh: "5.1 Payment methods" },
            "Services contracted through the Platform can be settled in two ways:",
            ["Cash: payment is made directly between Client and Provider at the time or agreement of service provision.", "Bank card: payment is processed securely through Stripe. All transactions are made in Mexican Pesos (MXN)."],
            { sh: "5.2 Monthly commission to Provider" },
            { b: false, v: "Use of the Platform as a Provider implies payment of a monthly commission of 3% on the total earnings accumulated in that month within Servease, regardless of the payment method used for each service." },
            { i: true, v: "Example: if a Provider accumulated $10,000 MXN in earnings during the month, the commission payable at the end of the period will be $300 MXN." },
            "This commission may be adjusted in future versions of the Platform, notifying users in advance as established in the modifications section of these Terms. The commission applies exclusively to Providers; Clients have no charges for using the Platform.",
            { sh: "5.3 Payments outside the platform" },
            "Servease is not responsible for agreements or payments made outside the Platform's internal channels. Providers are recommended to correctly record services performed for accurate calculation of their monthly commission."
          ]
        },
        {
          h: "6. Rating and Reputation System",
          c: [
            "Upon completion of a service, both parties may rate each other with a numerical score from 1 to 5 and leave comments. These ratings are public and form part of each user's reputation profile. The following is strictly prohibited:",
            ["Posting false or malicious ratings.", "Requesting or pressuring other users to obtain specific ratings.", "Creating fake accounts to manipulate the rating system."],
            "Servease reserves the right to remove ratings it deems fraudulent, abusive, or contrary to these Terms."
          ]
        },
        {
          h: "7. User Conduct",
          c: [
            "By using the Platform, the user agrees to:",
            ["Provide truthful and updated information in their profile and posts.", "Use the chat exclusively to coordinate details of the agreed service.", "Respect other users and maintain dignified and professional treatment.", "Not use the Platform for illegal, fraudulent or immoral activities.", "Not share sensitive personal information (bank details, passwords) through the chat.", "Not post offensive, discriminatory, threatening content or content that violates third party rights."],
            "Failure to comply with these rules may result in temporary suspension or permanent cancellation of the account, without prejudice to any legal actions that may apply."
          ]
        },
        {
          h: "8. Limitation of Liability",
          c: [
            "Servease acts solely as a technological intermediary and is not a party to the agreements entered into between Clients and Providers. Consequently, Servease assumes no responsibility for:",
            ["The quality, outcome or warranty of services provided by Providers.", "Material, personal or economic damages caused during service provision.", "Breach of agreements between Clients and Providers.", "The accuracy of information published by users.", "Service interruptions caused by force majeure, third-party failures or scheduled maintenance."],
            "Under no circumstances shall Servease's total liability to a user exceed the amount of the commission charged to the Provider in the monthly period subject to the claim."
          ]
        },
        {
          h: "9. Intellectual Property",
          c: [
            "All content on the Platform, including logos, designs, source code, interfaces, texts and graphics, is the exclusive property of Servease or its respective owners and is protected by applicable intellectual property laws in Mexico. The user may not copy, reproduce, distribute, modify or create derivative works without prior written consent from Servease.",
            "The user retains ownership of the content they publish and grants Servease a non-exclusive, royalty-free, revocable license to use it solely for the purpose of operating and improving the Platform."
          ]
        },
        {
          h: "10. Suspension and Cancellation",
          c: [
            "Servease reserves the right to suspend or cancel access to the Platform, temporarily or permanently and without prior notice, in the following cases:",
            ["Breach of these Terms and Conditions.", "Fraudulent or malicious use of the Platform.", "Activities that endanger the security of other users or the Platform.", "Court order or requirement from competent authority."],
            "The user may request cancellation of their account at any time. Cancellation does not exempt from pending obligations at the time of the request."
          ]
        },
        {
          h: "11. Geographic Scope",
          c: [
            "In its initial phase, the Platform operates exclusively within the municipality of Tijuana, Baja California, Mexico. Services outside this area will not be managed. Servease reserves the right to expand its geographic coverage in later development phases."
          ]
        },
        {
          h: "12. Applicable Law and Dispute Resolution",
          c: [
            "These Terms are governed by the laws in force in the United Mexican States. For any dispute, the parties submit to the jurisdiction of the competent courts of the city of Tijuana, Baja California, waiving any other jurisdiction. Before resorting to judicial proceedings, the parties agree to attempt to resolve any dispute amicably through Servease's official channels."
          ]
        },
        {
          h: "13. Contact",
          c: [
            { contact: true, email: "0323105874@ut-tijuana.edu.mx", institution: "Universidad Tecnológica de Tijuana", city: "Tijuana, Baja California, Mexico" }
          ]
        }
      ]
    },
    privacy: {
      title: "PRIVACY POLICY",
      subtitle: "Service Control and Contracting System",
      tagline: '"The Easiest way to find your solution"',
      version: "Version 1.0 | January 2026 | Tijuana, Baja California, Mexico",
      footer: "Servease © 2026 — All rights reserved.",
      intro: "At Servease we are committed to protecting your personal data. This Privacy Policy describes what information we collect, how we use it, who we share it with, and the rights you have over it. This document complies with the provisions of the Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP) in force in the United Mexican States.",
      accept: "By registering and using the Servease platform, you accept the terms of this Privacy Policy. If you do not agree with its content, we ask that you do not use the Platform.",
      sections: [
        {
          h: "1. Data Controller",
          c: [
            "The data controller is the Servease development team, made up of students from the Universidad Tecnológica de Tijuana under the academic project 'Service Control and Contracting System'.",
            { contact: true, email: "0323105874@ut-tijuana.edu.mx", institution: "Universidad Tecnológica de Tijuana", city: "Tijuana, Baja California, Mexico" }
          ]
        },
        {
          h: "2. Personal Data We Collect",
          c: [
            { sh: "2.1 Data provided directly by the user" },
            "When registering on the Platform, we collect only the following data:",
            ["Full name (first and last names).", "Email address.", "Password (stored encrypted; never in plain text).", "Profile photo (optional)."],
            { sh: "2.2 Data collected automatically" },
            "During use of the Platform, certain technical data is automatically collected:",
            ["Geolocation data: with your prior consent, your location is accessed to show available services within the municipality of Tijuana. You can revoke this permission from your browser or device settings.", "Usage and browsing data: pages visited, actions taken within the Platform, session time.", "Device information: browser type, operating system, IP address.", "System error logs for technical and maintenance purposes."],
            { sh: "2.3 Financial data" },
            { b: false, v: "Payments within the Platform can be made in cash or by bank card. Card payments are processed by Stripe, an external payment service provider. Servease does not store or have direct access to credit or debit card data. Processing of financial data with cards is governed by Stripe's privacy policy (stripe.com/privacy)." }
          ]
        },
        {
          h: "3. Purpose of Data Processing",
          c: [
            { sh: "3.1 Purposes necessary for the service" },
            ["Creation, management and authentication of user accounts.", "Management of the contracting process (posts, applications, counteroffers, acceptances).", "Facilitating communication between Clients and Providers through internal chat.", "Payment processing and collection of monthly commissions from Providers.", "Management of the rating and reputation system.", "Geolocation to show available services in the user's area within Tijuana.", "Attention to technical support requests and compliance with legal obligations."],
            { sh: "3.2 Secondary purposes (optional)" },
            ["Sending notifications about the status of services.", "Continuous improvement of the Platform through aggregated and anonymized usage analysis."],
            "If you do not wish your data to be used for secondary purposes, you may notify our team without this affecting normal use of the Platform."
          ]
        },
        {
          h: "4. Legal Basis for Processing",
          c: [
            ["Consent: by registering and accepting this Policy, you grant your free, express and informed consent.", "Contract performance: processing is necessary for the provision of the services offered by the Platform.", "Compliance with legal obligations: in cases where Mexican law so requires.", "Legitimate interest: for the security of the Platform, fraud prevention and technical maintenance."]
          ]
        },
        {
          h: "5. Data Sharing and Transfer",
          c: [
            { sh: "5.1 Data shared between users" },
            ["Clients can see the name, average rating, service history and profile information of the Provider.", "Providers can see the name, average rating and request history of the Client.", "The exact location of the service place is only revealed to the Provider once the Client formally accepts their application."],
            { sh: "5.2 External service providers" },
            ["Stripe: card payment processing and financial transaction management.", "Google Maps Platform: map rendering and geolocation services."],
            "These providers act as data processors and are obliged to protect your data in accordance with their own privacy policies and applicable regulations.",
            { sh: "5.3 Legal transfers" },
            "Servease may disclose personal data when legally required by court order or request from competent authority, or to protect the rights, property or security of the Platform and its users.",
            { sh: "5.4 No sale of data" },
            { b: true, v: "Servease does NOT sell, rent or market users' personal data to third parties for advertising or commercial purposes unrelated to the operation of the Platform." }
          ]
        },
        {
          h: "6. Geolocation",
          c: [
            "The Platform requests access to your geographic location to show available services in your area within the municipality of Tijuana. Its use requires your explicit consent through the browser or device. You may revoke permission at any time; doing so may limit some location-based functionalities. Location data is not permanently stored nor shared outside the Platform's operational context."
          ]
        },
        {
          h: "7. Data Security",
          c: [
            "Servease implements technical and organizational measures to protect your personal data:",
            ["Password encryption using secure hashing algorithms.", "Encrypted communication via HTTPS protocol with TLS 1.3 certificates.", "Role-based access control that restricts access to information according to user type.", "Input validation and sanitization to prevent injection attacks (SQL Injection, XSS).", "Error logging and internal auditing for incident detection and correction."],
            "No system can guarantee absolute security. In the event of a security breach affecting your data, we will notify you in accordance with applicable regulations."
          ]
        },
        {
          h: "8. Data Retention",
          c: [
            "Your data will be kept while your account remains active and for the time necessary to fulfill the described purposes. Upon requesting cancellation of your account, Servease will delete or anonymize your data within a reasonable period, except for data that must be retained due to legal obligations (e.g., financial transaction history)."
          ]
        },
        {
          h: "9. ARCO Rights of the Data Subject",
          c: [
            "In accordance with the LFPDPPP, you have the right to:",
            ["Access: know what personal data we have about you and how we use it.", "Rectification: request correction of inaccurate, incomplete or outdated data.", "Cancellation: request deletion of your data when no longer necessary or when you have withdrawn your consent.", "Objection: object to the processing of your data for specific purposes, including secondary ones."],
            { emailText: "0323105874@ut-tijuana.edu.mx", v: "To exercise these rights, send a request to {email} indicating your full name, registered email address, the right you wish to exercise, and a description of your request. We will respond within a maximum of 20 business days in accordance with the LFPDPPP." }
          ]
        },
        {
          h: "10. Use of Cookies",
          c: [
            "The Platform may use cookies to improve user experience, maintain active sessions, and collect usage information in aggregate form:",
            ["Session cookies: necessary to keep your session active. They are deleted when you close the browser.", "Preference cookies: store user settings to personalize the experience.", "Analytical cookies: collect statistical usage information in anonymized form."],
            "You can configure your browser to reject or delete cookies. Disabling session cookies may prevent the proper functioning of the Platform."
          ]
        },
        {
          h: "11. Minor Users",
          c: [
            "Creating a Profile as a Service Provider within the Platform is reserved exclusively for persons over 18 years of age with legal capacity to enter into contracts. Any person may register as a Client without age restriction; however, to activate the Provider role, confirmation of legal age will be required. Servease does not intentionally collect data from minors in contexts that imply contractual obligations or service provision. If we detect a contrary situation, we will manage the account in accordance with applicable regulations."
          ]
        },
        {
          h: "12. Changes to this Policy",
          c: [
            "Servease reserves the right to modify this Policy at any time. Modifications will be notified through the Platform and/or by email at least 10 days before they take effect. Continued use of the Platform after modifications constitutes acceptance."
          ]
        },
        {
          h: "13. Applicable Law",
          c: [
            "This Policy is governed by the Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP), its Regulations, and the Privacy Notice Guidelines published by INAI, in force in the United Mexican States."
          ]
        },
        {
          h: "14. Contact",
          c: [
            { contact: true, email: "0323105874@ut-tijuana.edu.mx", institution: "Universidad Tecnológica de Tijuana", city: "Tijuana, Baja California, Mexico" }
          ]
        }
      ]
    }
  }
};
