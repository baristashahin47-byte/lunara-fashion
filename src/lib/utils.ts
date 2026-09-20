import { DeliveryZone } from '../types.js';

export function formatBDT(amount: number, banglaDigits = false): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);

  if (!banglaDigits) {
    return `৳${formatted}`;
  }

  const enToBn: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    ',': ','
  };

  const bnFormatted = formatted.split('').map(char => enToBn[char] || char).join('');
  return `৳${bnFormatted}`;
}

export const BD_DIVISIONS = [
  'Dhaka (ঢাকা)',
  'Chattogram (চট্টগ্রাম)',
  'Rajshahi (রাজশাহী)',
  'Khulna (খুলনা)',
  'Barishal (বরিশাল)',
  'Sylhet (সিলেট)',
  'Rangpur (রংপুর)',
  'Mymensingh (ময়মনসিংহ)'
];

export const BD_DISTRICTS: Record<string, string[]> = {
  'Dhaka': [
    'Dhaka City', 'Gazipur', 'Narayanganj', 'Savar', 'Keraniganj', 'Tangail',
    'Narsingdi', 'Manikganj', 'Munshiganj', 'Faridpur', 'Gopalganj', 'Madaripur',
    'Rajbari', 'Shariatpur', 'Kishoreganj'
  ],
  'Chattogram': [
    'Chattogram', "Cox's Bazar", 'Cumilla', 'Feni', 'Brahmanbaria', 'Noakhali',
    'Chandpur', 'Lakshmipur', 'Rangamati', 'Khagrachhari', 'Bandarban'
  ],
  'Rajshahi': [
    'Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore',
    'Chapai Nawabganj', 'Joypurhat'
  ],
  'Khulna': [
    'Khulna', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat', 'Jhenaidah',
    'Chuadanga', 'Magura', 'Meherpur', 'Narail'
  ],
  'Barishal': [
    'Barishal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Barguna', 'Jhalokathi'
  ],
  'Sylhet': [
    'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'
  ],
  'Rangpur': [
    'Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Nilphamari',
    'Lalmonirhat', 'Thakurgaon', 'Panchagarh'
  ],
  'Mymensingh': [
    'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
  ]
};

export function getDeliveryZone(division: string, district: string): DeliveryZone {
  const cleanDistrict = district.toLowerCase();

  if (cleanDistrict === 'dhaka city' || (cleanDistrict === 'dhaka' && !cleanDistrict.includes('savar'))) {
    return 'DHAKA_CITY';
  }

  const subDhakaDistricts = ['gazipur', 'narayanganj', 'savar', 'keraniganj'];
  if (subDhakaDistricts.some(d => cleanDistrict.includes(d))) {
    return 'SUB_DHAKA';
  }

  return 'OUTSIDE_DHAKA';
}
