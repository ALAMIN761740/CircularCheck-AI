import type { SourceType, VerificationSource } from '../src/types/circular.ts';

export interface OfficialRegistryEntry extends VerificationSource {
  aliases: string[];
}

export const OFFICIAL_BANGLADESH_SOURCES: OfficialRegistryEntry[] = [
  {
    id: 'src-bpsc',
    organizationName: 'Bangladesh Public Service Commission (BPSC)',
    officialDomain: 'bpsc.gov.bd',
    officialRecruitmentUrl: 'https://www.bpsc.gov.bd',
    sourceType: 'Government',
    verificationNotes: 'Official portal for BCS and non-cadre government circulars; applications processed via bpsc.teletalk.com.bd.',
    aliases: ['bpsc', 'public service commission', 'bcs circular', 'বাংলাদেশ সরকারি কর্ম কমিশন'],
  },
  {
    id: 'src-teletalk',
    organizationName: 'Teletalk All Jobs (Government Recruitment Portal)',
    officialDomain: 'teletalk.com.bd',
    officialRecruitmentUrl: 'https://alljobs.teletalk.com.bd',
    sourceType: 'Government',
    verificationNotes: 'Authorized payment and online application gateway for Bangladesh government ministries and directorates.',
    aliases: ['teletalk', 'alljobs', 'টেলিটক'],
  },
  {
    id: 'src-bb',
    organizationName: 'Bangladesh Bank (Bankers Selection Committee)',
    officialDomain: 'bb.org.bd',
    officialRecruitmentUrl: 'https://erecruitment.bb.org.bd',
    sourceType: 'Banking',
    verificationNotes: 'Central bank and state-owned commercial bank recruitment portal; never collects fees via personal bKash/Nagad.',
    aliases: ['bangladesh bank', 'bankers selection', 'bb.org.bd', 'বাংলাদেশ ব্যাংক'],
  },
  {
    id: 'src-dpe',
    organizationName: 'Directorate of Primary Education (DPE)',
    officialDomain: 'dpe.gov.bd',
    officialRecruitmentUrl: 'https://www.dpe.gov.bd',
    sourceType: 'Government',
    verificationNotes: 'Official primary school teacher recruitment circulars; applications handled via dpe.teletalk.com.bd.',
    aliases: ['dpe', 'primary education', 'প্রাথমিক শিক্ষা অধিদপ্তর'],
  },
  {
    id: 'src-ntrca',
    organizationName: 'Non-Government Teachers Registration & Certification Authority (NTRCA)',
    officialDomain: 'ntrca.gov.bd',
    officialRecruitmentUrl: 'https://www.ntrca.gov.bd',
    sourceType: 'Education',
    verificationNotes: 'Official NTRCA teacher registration and recruitment notices.',
    aliases: ['ntrca', 'এনটিআরসিএ'],
  },
  {
    id: 'src-mopa',
    organizationName: 'Ministry of Public Administration',
    officialDomain: 'mopa.gov.bd',
    officialRecruitmentUrl: 'https://www.mopa.gov.bd',
    sourceType: 'Government',
    verificationNotes: 'Central government ministry notifications and official orders.',
    aliases: ['mopa', 'ministry of public administration', 'জনপ্রশাসন মন্ত্রণালয়'],
  },
  {
    id: 'src-sonali',
    organizationName: 'Sonali Bank PLC',
    officialDomain: 'sonalibank.com.bd',
    officialRecruitmentUrl: 'https://www.sonalibank.com.bd',
    sourceType: 'Banking',
    verificationNotes: 'State-owned commercial bank; officer recruitment coordinated through Bangladesh Bank e-recruitment.',
    aliases: ['sonali bank', 'সোনালী ব্যাংক'],
  },
  {
    id: 'src-brac',
    organizationName: 'BRAC Careers',
    officialDomain: 'brac.net',
    officialRecruitmentUrl: 'https://careers.brac.net',
    sourceType: 'NGO',
    verificationNotes: 'BRAC never charges any application, interview, or training fee at any stage of recruitment.',
    aliases: ['brac', 'ব্র্যাক'],
  },
  {
    id: 'src-gp',
    organizationName: 'Grameenphone Ltd.',
    officialDomain: 'grameenphone.com',
    officialRecruitmentUrl: 'https://www.grameenphone.com/about/careers',
    sourceType: 'Telecom & Corporate',
    verificationNotes: 'Corporate telecom careers; official emails always originate from @grameenphone.com.',
    aliases: ['grameenphone', 'গ্রামীণফোন'],
  },
  {
    id: 'src-bkash',
    organizationName: 'bKash Limited',
    officialDomain: 'bkash.com',
    officialRecruitmentUrl: 'https://www.bkash.com/en/about/career',
    sourceType: 'Telecom & Corporate',
    verificationNotes: 'Official bKash recruitment never requires sending money to personal mobile wallets.',
    aliases: ['bkash limited', 'bkash career'],
  },
  {
    id: 'src-robi',
    organizationName: 'Robi Axiata PLC',
    officialDomain: 'robi.com.bd',
    officialRecruitmentUrl: 'https://www.robi.com.bd/en/corporate/career',
    sourceType: 'Telecom & Corporate',
    verificationNotes: 'Official Robi corporate careers portal.',
    aliases: ['robi axiata', 'robi career'],
  },
  {
    id: 'src-du',
    organizationName: 'University of Dhaka',
    officialDomain: 'du.ac.bd',
    officialRecruitmentUrl: 'https://www.du.ac.bd',
    sourceType: 'Education',
    verificationNotes: 'Official university faculty and staff recruitment notices.',
    aliases: ['university of dhaka', 'dhaka university', 'ঢাকা বিশ্ববিদ্যালয়'],
  },
  {
    id: 'src-buet',
    organizationName: 'Bangladesh University of Engineering and Technology (BUET)',
    officialDomain: 'buet.ac.bd',
    officialRecruitmentUrl: 'https://www.buet.ac.bd',
    sourceType: 'Education',
    verificationNotes: 'Official BUET academic and administrative circulars.',
    aliases: ['buet', 'বুয়েট'],
  },
  {
    id: 'src-bdjobs',
    organizationName: 'Bdjobs.com',
    officialDomain: 'bdjobs.com',
    officialRecruitmentUrl: 'https://www.bdjobs.com',
    sourceType: 'Telecom & Corporate',
    verificationNotes: 'Major Bangladesh private-sector job board; still verify individual employer domains independently.',
    aliases: ['bdjobs'],
  },
];

export interface UrlCheckResult {
  valid: boolean;
  isSafeToFetch: boolean;
  hostname: string;
  protocol: string;
  warnings: string[];
  matchedOfficialSource?: OfficialRegistryEntry;
  isLookalike: boolean;
}

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.loan', '.work', '.buzz'];
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'rb.gy', 'is.gd', 'shorturl.at'];
const FREE_HOST_BUILDERS = ['blogspot.com', 'wordpress.com', 'wixsite.com', 'sites.google.com', 'weebly.com', '000webhostapp.com'];

function isPrivateOrLoopbackHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '0.0.0.0' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return true;
  }

  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const a = Number(ipv4Match[1]);
    const b = Number(ipv4Match[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
  }
  return false;
}

export function analyzeUrlSafety(rawUrl: string): UrlCheckResult {
  const warnings: string[] = [];
  let parsed: URL;
  try {
    const normalized = /^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `https://${rawUrl.trim()}`;
    parsed = new URL(normalized);
  } catch {
    return {
      valid: false,
      isSafeToFetch: false,
      hostname: '',
      protocol: '',
      warnings: ['URL format is invalid or malformed.'],
      isLookalike: false,
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      isSafeToFetch: false,
      hostname: parsed.hostname,
      protocol: parsed.protocol,
      warnings: [`Disallowed URL scheme (${parsed.protocol}). Only HTTP/HTTPS are permitted.`],
      isLookalike: false,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isPrivate = isPrivateOrLoopbackHost(hostname);
  if (isPrivate) {
    warnings.push('Target resolves to a private, loopback, or internal network host and cannot be fetched.');
  }

  if (parsed.protocol === 'http:') {
    warnings.push('Website uses unencrypted HTTP instead of HTTPS.');
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    warnings.push('URL uses a raw IP address instead of an official organization domain.');
  }

  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    warnings.push('Domain uses a high-risk disposable top-level domain.');
  }

  if (URL_SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`))) {
    warnings.push('Link uses a URL shortener that obscures the true destination.');
  }

  if (FREE_HOST_BUILDERS.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
    warnings.push('Hosted on a free blog/site builder rather than an official corporate or .gov.bd domain.');
  }

  const matchedOfficialSource = OFFICIAL_BANGLADESH_SOURCES.find(
    (src) => hostname === src.officialDomain || hostname.endsWith(`.${src.officialDomain}`)
  );

  // Lookalike check: mentions known org keyword in hostname without matching the official domain
  let isLookalike = false;
  if (!matchedOfficialSource) {
    const lookalikeTokens = ['bpsc', 'teletalk', 'bangladeshbank', 'dpe-gov', 'ntrca', 'brac', 'grameenphone', 'sonalibank', 'gov-bd', 'govtjob'];
    if (lookalikeTokens.some((tok) => hostname.includes(tok))) {
      isLookalike = true;
      warnings.push(`Domain "${hostname}" resembles an official Bangladeshi institution but does not match its verified domain.`);
    }
  }

  return {
    valid: true,
    isSafeToFetch: !isPrivate,
    hostname,
    protocol: parsed.protocol,
    warnings,
    matchedOfficialSource,
    isLookalike,
  };
}

export function matchOrganizationSources(orgName: string, text: string): OfficialRegistryEntry[] {
  const haystack = `${orgName} ${text}`.toLowerCase();
  return OFFICIAL_BANGLADESH_SOURCES.filter((entry) => {
    if (haystack.includes(entry.officialDomain)) return true;
    return entry.aliases.some((alias) => haystack.includes(alias));
  });
}

export function toPublicSource(entry: OfficialRegistryEntry): VerificationSource {
  return {
    id: entry.id,
    organizationName: entry.organizationName,
    officialDomain: entry.officialDomain,
    officialRecruitmentUrl: entry.officialRecruitmentUrl,
    sourceType: entry.sourceType as SourceType,
    verificationNotes: entry.verificationNotes,
  };
}
