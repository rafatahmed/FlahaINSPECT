/** EN is the live UI. AR keys exist for G-09 / R3 — do not wire a login toggle. */
export const en = {
  productName: 'FlahaINSPECT',
  login: 'Log in',
  email: 'Email',
  password: 'Password',
  genericLoginFailure: 'Email or password is incorrect.',
  accountLocked: 'Try again in 15 minutes',
  reports: 'Reports',
  generatePdf: 'Generate PDF',
  download: 'Download',
  categoryDefect: 'Defect',
  categoryNormal: 'Normal',
  categoryNote: 'Note',
} as const;

export const ar: { [K in keyof typeof en]: string } = {
  productName: 'FlahaINSPECT',
  login: 'تسجيل الدخول',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  genericLoginFailure: 'البريد أو كلمة المرور غير صحيحة.',
  accountLocked: 'حاول مرة أخرى خلال 15 دقيقة',
  reports: 'التقارير',
  generatePdf: 'إنشاء PDF',
  download: 'تنزيل',
  categoryDefect: 'عيب',
  categoryNormal: 'طبيعي',
  categoryNote: 'ملاحظة',
};

export const lockedUiLocale = 'en';
export const rtlLocales = ['ar'] as const;
