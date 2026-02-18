"use client";

import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface Data {
  title: string;
  description: string;
}

const data: Data[] = [
  {
    title: "Introduction",
    description:
      "This Privacy Policy explains how Vendorcliq Platforms Limited processes the personal information of our customers, vendors, staff, third parties, and visitors to our websites and mobile applications. These channels include our inventory management platform, vendor-to-vendor marketplace, and credit services. This policy describes what personal information we collect, what we do with it, and how we protect it. We are committed to safeguarding your personal data in line with the Nigeria Data Protection Act 2023 and other applicable data protection laws. By continuing to use our services, you consent to the practices described in this policy.",
  },
  {
    title: "Privacy Mission Statement",
    description:
      "Our mission at Vendcliq is to keep your personal information safe and protect your privacy while helping you run your business more efficiently. We understand the trust you place in us when you use our services, and we take that responsibility seriously. We aim to communicate clearly how your information is handled and to always act in your best interest.",
  },
  {
    title: "General Principles for Processing Personal Date",
    description:
      "When we process your personal data, we ensure that it is handled in a lawful, fair, and transparent manner. We only collect information for clear and legitimate purposes and will not use it in ways that are not compatible with those purposes. We collect only the data we need, ensure it is accurate and up to date, and protect it from unauthorized access or misuse. We take accountability for the way we handle your information and work to maintain its confidentiality, integrity, and availability at all times.",
  },
  {
    title: "Lawful Basis for Collecting and Processing Personal Data",
    description:
      "We process your data with your consent, when it is necessary to fulfill a contract, when the law requires it, when it is in our legitimate interest to do so, when it is necessary to protect your vital interests, and when required for tasks in the public interest.",
  },
  {
    title: "Information We May Collect from you",
    description:
      "We may collect information you provide to us such as your name, business registration details, identification documents, contact information, bank account details, wallet balances, transaction history, and credit usage. We may also collect technical information such as your IP address, device type, location data, and records of your interactions with our platform.",
  },
  {
    title: "How We Collect Information",
    description:
      "We collect information directly from you when you sign up for our services, place orders, or apply for credit. We also collect information automatically when you use our website or mobile application, including through cookies and analytics tools. In some cases, we may receive information about you from third parties such as payment processors, logistics partners, or credit bureaus.",
  },
  {
    title: "How We Use Your Personal Data",
    description:
      "We use your data to provide and manage our services, process orders and payments, deliver goods, verify your identity, assess credit eligibility, and improve our platform. We also use your information to communicate with you, send important updates, prevent fraud, and comply with regulatory requirements.",
  },
  {
    title: "Automated Processing and Artificial Intelligence",
    description:
      "We use automation and artificial intelligence to enhance our services. This includes predicting the stock you may need based on your sales trends, assessing your eligibility for credit, detecting suspicious transactions, and providing support through chatbots. You can request a review of any decision that has a significant impact on you and has been made using automated processes.",
  },
  {
    title: "Your Rights as a Data Subject",
    description:
      "You have the right to be informed about how your data is processed, to access the personal data we hold about you, to request corrections, to request deletion in certain circumstances, to withdraw consent, to object to certain processing activities, and to request that your data be transferred to another party.",
  },
  {
    title: "Retention of Your Data",
    description:
      "We will not keep your personal data longer than necessary for the purposes it was collected or as required by law. Financial transaction records are kept for at least five years in line with regulatory requirements.",
  },
  {
    title: "Accuracy of Your Data",
    description:
      "It is important that your data is accurate and current. You can update your information in your account settings or contact our Data Protection Officer if you need assistance.",
  },
  {
    title: "Security of Your Data",
    description:
      "We use encryption, multi-factor authentication, access controls, and secure servers to protect your information. We conduct regular security audits and train our employees on data protection best practices.",
  },
  {
    title: "Data Transfer and Sharing",
    description:
      "We may share your data with logistics partners, payment processors, credit bureaus, technology providers, and regulators where required by law. All third parties must comply with our data protection standards and sign a Data Processing Agreement.",
  },
  {
    title: "Use of Cookies",
    description:
      "We use cookies to enhance your experience on our website and mobile app. Cookies help us remember your preferences, improve site performance, and analyse usage patterns. You can control or disable cookies in your browser settings, but some features may not work properly without them.",
  },
  {
    title: "Links to Other Sites",
    description:
      "Our platform may contain links to websites operated by third parties. We are not responsible for the privacy practices of these sites and encourage you to review their policies.",
  },
  {
    title: "Promotional Materials",
    description:
      "From time to time, we may send you promotional offers or updates we believe may interest you. You can opt out of these communications at any time by following the unsubscribe link in our emails or contacting us directly.",
  },
  {
    title: "Complaints",
    description:
      "If you believe your data has been mishandled, you can contact our Data Protection Officer at dpo@vendcliq.com or file a complaint with the Nigeria Data Protection Commission.",
  },
  {
    title: "Updates to the Privacy Policy",
    description:
      "We may update this policy from time to time to reflect changes in our services or legal requirements. We will post the latest version on our website, and your continued use of our services will signify your acceptance of the updated policy.",
  },
];
const TermsOfService = () => {
  return (
    <div className="">
      <div className="mb-4">
        <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
          Terms of Service{" "}
        </h1>
        <Separator
          orientation="horizontal"
          className="h-[1px] mt-3"
          style={{ background: "#E0E0E0" }}
        />
        <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
          Read and understand the rules, rights, and responsibilities of using
          the Vendcliq app
        </p>
      </div>
      <div className="flex flex-col gap-5">
        {data.map((item, index) => {
          const { title, description } = item;
          return (
            <div key={index} className="text-[#2F2F2F]">
              <h1 className="text-[15px] md:text-[18px] font-semibold font-clash ">
                {title}
              </h1>
              <p className="font-regular font-dm-sans">{description}</p>
            </div>
          );
        })}
      </div>
   
    </div>
  );
};

export default TermsOfService;
