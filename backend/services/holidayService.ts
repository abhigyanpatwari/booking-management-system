const API_BASE_URL = "https://date.nager.at/api/v3";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export async function getHolidays(countryCode: string, year: number): Promise<Holiday[]> {
  const cacheKey = `holidays:${countryCode}:${year}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  const response = await fetch(`${API_BASE_URL}/PublicHolidays/${year}/${countryCode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch holidays: ${response.statusText}`);
  }

  const holidays: Holiday[] = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify({
    data: holidays,
    timestamp: Date.now()
  }));

  return holidays;
}

export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateString = date.toISOString().split('T')[0];
  return holidays.some(holiday => holiday.date === dateString);
}
