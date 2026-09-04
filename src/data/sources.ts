export type Source = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  /** What this document is actually being used to support. */
  supports: string[];
  /** Honest caveats about traceability, where they exist. */
  note?: string;
  kind: 'press-note' | 'methodology' | 'faq' | 'archive' | 'clarification';
};

export const sources: Source[] = [
  {
    id: 'q1-fy2627-press-note',
    title: 'Quarterly Estimates of Gross Domestic Product for the First Quarter (April–June) of 2026–27',
    publisher: 'Ministry of Statistics and Programme Implementation (MoSPI)',
    date: '31 August 2026',
    url: 'https://www.mospi.gov.in/uploads/latestReleases/latest_release_1788172583113_d65a77cf-240e-4491-82ee-59f78618fa41_Press_Note_on_GDP_Estimates_for_Q1_2026-27.pdf',
    kind: 'press-note',
    supports: [
      'Nominal GDP ₹88.27 lakh crore in Q1 FY 2026–27 against ₹80.00 lakh crore in Q1 FY 2025–26 (10.3%)',
      'Real GDP ₹81.36 lakh crore against ₹75.46 lakh crore (7.8%)',
      'The ₹80.00 lakh crore latest comparable estimate for Q1 FY 2025–26',
    ],
  },
  {
    id: 'new-series-press-note',
    title: 'Press Note on New Series of GDP Estimates with Base Year 2022–23',
    publisher: 'MoSPI / Press Information Bureau',
    date: '27 February 2026',
    url: 'https://www.mospi.gov.in/uploads/latestReleases/latest_release_1772189865181_f040336d-bc57-4aed-b80f-586d9ccb279e_Press_Note_on_New_Series_of_GDP_Estimates_with_Base_Year_2022-23_27022026.pdf',
    kind: 'press-note',
    supports: [
      'The switch from base year 2011–12 to 2022–23',
      'Why FY 2022–23 was chosen as the base year',
      'The ₹80.32 lakh crore re-estimate of Q1 FY 2025–26 on the new series',
    ],
  },
  {
    id: 'new-series-pib',
    title: 'New Series of Gross Domestic Product (GDP) Estimates with Base Year 2022–23',
    publisher: 'Press Information Bureau',
    date: '27 February 2026',
    url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2233518&reg=3&lang=1',
    kind: 'press-note',
    supports: ['A readable summary of the base-year change and what it covers'],
  },
  {
    id: 'new-series-faq',
    title: 'Understanding the New Series of GDP — Frequently Asked Questions',
    publisher: 'MoSPI',
    date: '26 February 2026',
    url: 'https://www.mospi.gov.in/uploads/announcements/announcements_1772117257791_84ae898f-7be2-4b7d-a135-565e1a809513_FAQ_GDP_26022026_1902.pdf',
    kind: 'faq',
    supports: [
      'What a base-year revision changes beyond the printed year',
      'Improved source data and coverage in the new series',
      'Why estimates for past periods can move up as well as down',
    ],
  },
  {
    id: 'post-q1-clarification',
    title: 'Additional Information related to GDP Estimates Received After Release of Q1 Estimates of FY 2026–27',
    publisher: 'Press Information Bureau / MoSPI',
    date: '2 September 2026',
    url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2305896&reg=3&lang=1',
    kind: 'clarification',
    supports: [
      'The official account of why Q1 FY 2025–26 moved ₹86.05 → ₹80.32 → ₹80.44 → ₹80.00',
      'The statement that ₹86.05 lakh crore (old series) is not directly comparable with the new series',
      'Adoption of double deflation and the resulting behaviour of implicit deflators',
    ],
  },
  {
    id: 'pe-fy2526-press-note',
    title:
      'Provisional Estimates of Annual GDP for 2025–26 and Quarterly Estimates for the Fourth Quarter (January–March) of 2025–26',
    publisher: 'MoSPI',
    date: '5 June 2026',
    url: 'https://www.mospi.gov.in/uploads/latestReleases/latest_release_1780655857536_5ac01869-ca4a-422d-b7a7-57b81da60932_Press_Note_on_GDP_Estimates_for_Q4_2025-26_and_PE_FY_2025-26_F.pdf',
    kind: 'press-note',
    supports: ['The ₹80.44 lakh crore re-estimate of Q1 FY 2025–26'],
  },
  {
    id: 'quarterly-methodology-paper',
    title: 'Discussion Paper on "Changes in Methodology of Quarterly GDP series and Sub-national Accounts"',
    publisher: 'MoSPI',
    date: 'January 2026',
    url: 'https://www.mospi.gov.in/uploads/latestReleases/latest_release_1769167173072_3d5ef121-7ec8-48e3-b085-b2b4bf6d5563_Press_Note_on_release_of_discussion_paper_on_%C3%A2%C2%80%C2%9CChanges_in_Methodology_of_Quarterly_GDP_series_and_Sub-national_Accounts%C3%A2%C2%80%C2%9D.pdf',
    kind: 'methodology',
    supports: ['Methodological changes proposed and consulted on ahead of the new quarterly series'],
  },
  {
    id: 'q1-fy2526-press-note',
    title: 'Quarterly Estimates of GDP for the First Quarter (April–June) of 2025–26',
    publisher: 'MoSPI',
    date: '29 August 2025',
    url: 'https://www.mospi.gov.in/press-release',
    kind: 'archive',
    note:
      'This is the original old-series release that reported ₹86.05 lakh crore. It is listed in the MoSPI press-release archive under 29 August 2025; the archive is linked here rather than a deep PDF link because MoSPI regenerates release file URLs when the site is reorganised.',
    supports: ['The ₹86.05 lakh crore first estimate of Q1 FY 2025–26 on the 2011–12 series'],
  },
  {
    id: 'mospi-gdp-hub',
    title: 'Gross Domestic Product — release archive and data',
    publisher: 'MoSPI',
    date: 'Continuously updated',
    url: 'https://www.mospi.gov.in/themes/product/6-gross-domestic-product',
    kind: 'archive',
    supports: ['All GDP press notes, back series and statement tables'],
  },
  {
    id: 'nas-history',
    title: 'National Accounts Statistics — publications archive',
    publisher: 'MoSPI',
    date: 'Continuously updated',
    url: 'https://www.mospi.gov.in/publication/national-accounts-statistics',
    kind: 'archive',
    note:
      'Used for the base-year history table. Publication conventions differ across decades: earlier revisions were announced through National Accounts Statistics volumes and committee reports rather than a single dated press release, so some historical dates are year-level rather than day-level.',
    supports: ['India’s sequence of national-accounts base years and when each was introduced'],
  },
  {
    id: 'base-2011-12-pib',
    title: 'New Series of National Accounts with Base Year 2011–12',
    publisher: 'Press Information Bureau',
    date: '30 January 2015',
    url: 'https://www.pib.gov.in/newsite/PrintRelease.aspx?relid=114971',
    kind: 'press-note',
    supports: ['The previous base-year change, from 2004–05 to 2011–12, released on 30 January 2015'],
  },
];

export const sourceById = (id: string) => sources.find((s) => s.id === id);
