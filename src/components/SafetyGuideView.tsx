import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import type { AppRoute } from './TopNav';

interface SafetyGuideViewProps {
  lang: 'en' | 'bn';
  onChangeLang: (lang: 'en' | 'bn') => void;
  onNavigate: (route: AppRoute) => void;
}

const GUIDE_ITEMS = [
  {
    num: '01',
    titleEn: 'Personal Mobile Wallet Payment Traps (bKash / Nagad / Rocket)',
    titleBn: 'ব্যক্তিগত বিকাশ, নগদ বা রকেট নম্বরে ফি পাঠানোর ফাঁদ',
    bodyEn:
      'Government ministries and autonomous commissions in Bangladesh collect application fees via Teletalk SMS, Sonali e-Sheba, or official bank treasury challans. Legitimate employers like BRAC or multinational companies do not ask candidates to send interview or training deposits to personal mobile numbers.',
    bodyBn:
      'বাংলাদেশের সরকারি ও স্বায়ত্তশাসিত প্রতিষ্ঠানের আবেদন ফি টেলিটক, সোনালী ই-সেবা বা ব্যাংক চালানের মাধ্যমে পরিশোধ করতে হয়। কোনো ব্যক্তিগত বিকাশ, নগদ বা রকেট নম্বরে সেন্ড মানি করতে বলা হলে সেটি প্রতারণার স্পষ্ট লক্ষণ।',
  },
  {
    num: '02',
    titleEn: 'Lookalike Domains & Free Blogspot / Google Sites Portals',
    titleBn: 'ভুয়া ডোমেইন ও ফ্রি ব্লগস্পট / ওয়েবসাইট লিংক চেনা',
    bodyEn:
      'Scammers register domains like "bpsc-job-bd.xyz" or host fake forms on blogspot.com and sites.google.com. Always verify that official government websites end strictly in ".gov.bd" or ".teletalk.com.bd", and confirm HTTPS alone never proves an organization is real.',
    bodyBn:
      'প্রতারকরা আসল ওয়েবসাইটের নামের কাছাকাছি ভুয়া ডোমেইন (.xyz, blogspot.com) তৈরি করে আবেদনপত্র সংগ্রহ করে। সরকারি বিজ্ঞপ্তির ক্ষেত্রে ওয়েবসাইটটি অবশ্যই .gov.bd বা .teletalk.com.bd ডোমেইনের কি না তা যাচাই করুন।',
  },
  {
    num: '03',
    titleEn: 'Free Webmail Contacts & Messaging-Only Interviews',
    titleBn: 'জিমেইল/ইয়াহু এবং হোয়াটসঅ্যাপ-ভিত্তিক ভুয়া নিয়োগ',
    bodyEn:
      'When a circular claims to be from a bank, NGO, or ministry but asks you to email your CV to a @gmail.com address or send documents over WhatsApp/IMO without an official domain notice, treat it as unverified until confirmed independently.',
    bodyBn:
      'ব্যাংক, এনজিও বা সরকারি দপ্তরের নামে প্রকাশিত বিজ্ঞপ্তিতে যদি @gmail.com ইমেইল বা শুধু হোয়াটসঅ্যাপ/ইমো নম্বরে যোগাযোগ করতে বলা হয়, তবে অফিসিয়াল ওয়েবসাইট থেকে সত্যতা নিশ্চিত না হয়ে আবেদন করবেন না।',
  },
  {
    num: '04',
    titleEn: 'Protecting Your NID, Photos & Financial Credentials',
    titleBn: 'জাতীয় পরিচয়পত্র (NID) ও ব্যাংক তথ্যের সুরক্ষা',
    bodyEn:
      'Never submit clear scans of your National ID card, passport, selfie holding NID, or mobile banking PIN/OTP during initial job application screening. Identity verification happens only during formal onboarding after an official selection process.',
    bodyBn:
      'প্রাথমিক আবেদনের সময়ই এনআইডি কার্ডের ছবি, সেলফি বা ব্যাংক/মোবাইল ব্যাংকিংয়ের গোপন পিন-ওটিপি শেয়ার করবেন না। চূড়ান্ত নিয়োগের আগে এ ধরনের তথ্য চাওয়া অত্যন্ত ঝুঁকিপূর্ণ।',
  },
];

const CHECKLIST = {
  en: [
    'Search the exact Memorandum Number (স্মারক নং) on the organization’s official website.',
    'Confirm the domain matches the verified directory (.gov.bd, .org.bd, or corporate domain).',
    'Never transfer training, verification, or registration money to any personal mobile number.',
    'Compare job title, pay grade, and deadline with national newspapers or Teletalk All Jobs.',
    'Report suspicious circulars to help warn other job seekers in Bangladesh.',
  ],
  bn: [
    'বিজ্ঞপ্তির স্মারক নম্বরটি সংশ্লিষ্ট প্রতিষ্ঠানের মূল ওয়েবসাইটে খুঁজে যাচাই করুন।',
    'ওয়েবসাইটের ঠিকানা আসল .gov.bd বা প্রতিষ্ঠানের অফিসিয়াল ডোমেইন কি না তা নিশ্চিত হোন।',
    'প্রশিক্ষণ, ফরম বা চাকরির নিশ্চয়তার নামে কোনো ব্যক্তিগত নম্বরে টাকা পাঠাবেন না।',
    'পদের নাম, বেতন স্কেল ও শেষ তারিখ টেলিটক অল-জবস বা জাতীয় পত্রিকার সাথে মিলিয়ে দেখুন।',
    'সন্দেহজনক বিজ্ঞপ্তি পেলে অন্য চাকরিপ্রার্থীদের সতর্ক করতে কমিউনিটি রিপোর্ট জমা দিন।',
  ],
};

export function SafetyGuideView({
  lang,
  onChangeLang,
  onNavigate,
}: SafetyGuideViewProps) {
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {lang === 'bn'
              ? 'ভুয়া নিয়োগ বিজ্ঞপ্তি শনাক্তকরণ নির্দেশিকা'
              : 'Job Circular Safety & Verification Guide'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {lang === 'bn'
              ? 'বাংলাদেশে অনলাইন চাকরিপ্রার্থীদের জন্য নিরাপদ আবেদন ও প্রতারণা প্রতিরোধের ব্যবহারিক নিয়মাবলি।'
              : 'Practical verification practices for Bangladeshi job seekers evaluating online recruitment advertisements.'}
          </p>
        </div>

        <div className="flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              lang === 'en' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('bn')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              lang === 'bn' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Editorial Feature Pair */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-5">
          {!img1Error ? (
            <img
              src="/src/assets/images/guide_scam_awareness_1795613473669.jpg"
              alt="Smartphone and notebook representing careful recruitment verification"
              referrerPolicy="no-referrer"
              onError={() => setImg1Error(true)}
              className="h-64 w-full object-cover lg:h-full"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-slate-100 lg:h-full">
              <ShieldAlert className="h-10 w-10 text-teal-700" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-7 lg:col-span-7">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {lang === 'bn'
              ? 'আবেদনের আগে ৫টি অবশ্যপালনীয় যাচাই ধাপ'
              : '5-Step Verification Checklist Before You Apply'}
          </h2>
          <ul className="mt-5 space-y-3.5">
            {CHECKLIST[lang].map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-mono-tabular text-slate-900">0{i + 1}.</strong> {step}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => onNavigate('scan')}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors"
            >
              <span>{lang === 'bn' ? 'এখনই বিজ্ঞপ্তি যাচাই করুন' : 'Scan a Circular Now'}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Common Fraud Patterns */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {GUIDE_ITEMS.map((item) => (
          <div key={item.num} className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="font-mono-tabular text-xs font-semibold text-teal-800">
              Pattern {item.num}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900">
              {lang === 'bn' ? item.titleBn : item.titleEn}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {lang === 'bn' ? item.bodyBn : item.bodyEn}
            </p>
          </div>
        ))}
      </div>

      {/* Institutional Verification Visual */}
      <div className="mt-10 grid grid-cols-1 items-stretch gap-8 rounded-xl border border-slate-200 bg-white p-6 lg:grid-cols-12">
        <div className="flex flex-col justify-center lg:col-span-7">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {lang === 'bn'
              ? 'ক্যাম্পাস ক্যারিয়ার সেন্টার ও সচেতনতা কার্যক্রম'
              : 'Share Verified Warnings With Your Community'}
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
            {lang === 'bn'
              ? 'বিশ্ববিদ্যালয়ের শিক্ষার্থী এবং নতুন চাকরিপ্রার্থীরা অনেক সময় ফরোয়ার্ড করা মেসেজের ফাঁদে পড়েন। সন্দেহজনক কোনো বিজ্ঞপ্তি দেখলে কমিউনিটি বোর্ডে রিপোর্ট করুন।'
              : 'Fresh graduates and first-time public-sector applicants are frequently targeted through forwarded social media circulars. Submitting suspicious circulars helps moderators publish verified community warnings.'}
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              <span>{lang === 'bn' ? 'কমিউনিটি অ্যালার্ট দেখুন' : 'Visit Community Alerts'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 lg:col-span-5">
          {!img2Error ? (
            <img
              src="/src/assets/images/verified_portal_desk_1795613474372.jpg"
              alt="Career counseling and verification desk"
              referrerPolicy="no-referrer"
              onError={() => setImg2Error(true)}
              className="h-56 w-full object-cover lg:h-full"
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-slate-100 lg:h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
