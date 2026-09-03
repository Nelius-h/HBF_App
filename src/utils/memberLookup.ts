import { UserProfile } from '../types';

/**
 * Normalizes any South African or international telephone number
 * Extracts raw digits and the core 9-digit national subscriber number.
 */
export function normalizePhone(phone: string | undefined | null): {
  rawDigits: string;
  nat9: string;
} {
  if (!phone) return { rawDigits: '', nat9: '' };
  const rawDigits = phone.replace(/\D/g, '');
  if (!rawDigits) return { rawDigits: '', nat9: '' };

  let nat9 = rawDigits;
  // If starts with 27 (SA country code, e.g. 27823065808 -> 823065808)
  if (nat9.startsWith('27') && nat9.length >= 11) {
    nat9 = nat9.slice(2);
  } else if (nat9.startsWith('0') && nat9.length >= 10) {
    nat9 = nat9.slice(1);
  }

  // Ensure last 9 digits if longer
  if (nat9.length > 9) {
    nat9 = nat9.slice(-9);
  }

  return { rawDigits, nat9 };
}

/**
 * Normalizes text by removing diacritics/accents, lowercasing, and collapsing whitespace.
 */
export function normalizeText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches a user against a phone query
 */
export function isPhoneMatch(user: UserProfile, phoneQuery: string): boolean {
  const queryPhone = normalizePhone(phoneQuery);
  if (!queryPhone.rawDigits || queryPhone.rawDigits.length < 6) {
    return false;
  }

  const checkPhoneString = (targetPhone?: string) => {
    if (!targetPhone) return false;
    const targetNorm = normalizePhone(targetPhone);
    if (!targetNorm.rawDigits) return false;

    // 1. Direct raw digits equality
    if (targetNorm.rawDigits === queryPhone.rawDigits) return true;

    // 2. 9-digit national subscriber match (e.g. 823065808 matches 0823065808 and +27823065808)
    if (queryPhone.nat9.length === 9 && targetNorm.nat9.length === 9) {
      if (queryPhone.nat9 === targetNorm.nat9) return true;
    }

    // 3. Suffix / Prefix overlap if query has >= 7 digits
    if (queryPhone.rawDigits.length >= 7) {
      if (
        targetNorm.rawDigits.endsWith(queryPhone.rawDigits) ||
        queryPhone.rawDigits.endsWith(targetNorm.rawDigits) ||
        (targetNorm.nat9 && queryPhone.nat9 && (targetNorm.nat9.endsWith(queryPhone.nat9) || queryPhone.nat9.endsWith(targetNorm.nat9)))
      ) {
        return true;
      }
    }

    return false;
  };

  // Check primary phone
  if (checkPhoneString(user.primaryPhone)) return true;

  // Check secondary phone
  if (checkPhoneString(user.secondaryPhone)) return true;

  // Check family members phones
  if (user.familyMembers && user.familyMembers.length > 0) {
    for (const fam of user.familyMembers) {
      if (checkPhoneString(fam.phone)) return true;
    }
  }

  // Check emergency contacts if present
  if (user.medicalAid?.emergencyContactNumber && checkPhoneString(user.medicalAid.emergencyContactNumber)) {
    return true;
  }

  return false;
}

/**
 * Comprehensive Member Lookup Algorithm:
 * Supports:
 * - Full Name ("Cornelius Hattingh", "Hendrik Badenhorst")
 * - Reversed Name ("Hattingh Cornelius", "Badenhorst Hendrik")
 * - Single First Name ("Cornelius", "Hendrik", "Kobus")
 * - Single Surname ("Hattingh", "Badenhorst", "Van der Merwe", "Du Plessis")
 * - Initial + Surname ("C. Hattingh", "H Badenhorst")
 * - Cell / Mobile / Sell Number ("082 306 5808", "0823065808", "+27 82 306 5808", "823065808")
 * - Email address ("hattinghcornelius@gmail.com")
 * - Farm Name ("Tierfontein", "Witfontein", "Kafferskraal")
 * - Callsign / Radio ID ("HBF-01")
 * - Member ID / UID ("USR-MGMT-ADMIN", "USR-CLIENT-001")
 */
export function findUserByLoginIdentifier(users: UserProfile[], identifier: string): UserProfile | null {
  const raw = (identifier || '').trim();
  if (!raw) return null;

  const lowerRaw = raw.toLowerCase();
  const normQuery = normalizeText(raw);
  const queryTokens = normQuery.split(' ').filter(Boolean);
  const queryPhone = normalizePhone(raw);
  const isDigitsOnly = /^\+?[\d\s\-().]+$/.test(raw) && queryPhone.rawDigits.length >= 6;

  // 1. Exact Email match
  const emailMatch = users.find((u) => u.email && u.email.trim().toLowerCase() === lowerRaw);
  if (emailMatch) return emailMatch;

  // 2. Exact Member UID match
  const uidMatch = users.find((u) => u.uid && u.uid.trim().toLowerCase() === lowerRaw);
  if (uidMatch) return uidMatch;

  // 3. Sell / Cell Phone match (High Priority if user typed digits)
  if (isDigitsOnly || queryPhone.rawDigits.length >= 7) {
    const phoneMatch = users.find((u) => isPhoneMatch(u, raw));
    if (phoneMatch) return phoneMatch;
  }

  // 4. Exact Full Name Match (Both "Name Surname" and "Surname Name")
  const exactFullNameMatch = users.find((u) => {
    const uFirst = normalizeText(u.name);
    const uLast = normalizeText(u.surname);
    const full1 = `${uFirst} ${uLast}`.trim();
    const full2 = `${uLast} ${uFirst}`.trim();
    return full1 === normQuery || full2 === normQuery;
  });
  if (exactFullNameMatch) return exactFullNameMatch;

  // 5. Exact First Name Match or Exact Surname Match
  const exactFirstOrLastNameMatch = users.find((u) => {
    const uFirst = normalizeText(u.name);
    const uLast = normalizeText(u.surname);
    return (uFirst && uFirst === normQuery) || (uLast && uLast === normQuery);
  });
  if (exactFirstOrLastNameMatch) return exactFirstOrLastNameMatch;

  // 6. Token-based Multi-word Match (e.g. "C Hattingh", "Hendrik Witfontein", "Badenhorst Hendrik")
  if (queryTokens.length > 1) {
    const tokenMatch = users.find((u) => {
      const uFirst = normalizeText(u.name);
      const uLast = normalizeText(u.surname);
      const uFarm = normalizeText(u.farmName);
      const combined = `${uFirst} ${uLast} ${uFarm}`;

      // Check if every token in the query exists in the user's name/farm
      return queryTokens.every((token) => {
        if (token.length === 1) {
          // Initial match (e.g. "c" in "c hattingh")
          return uFirst.startsWith(token) || uLast.startsWith(token);
        }
        return combined.includes(token);
      });
    });
    if (tokenMatch) return tokenMatch;
  }

  // 7. Substring Name Match (if query has at least 3 characters)
  if (normQuery.length >= 3) {
    const substringMatch = users.find((u) => {
      const uFirst = normalizeText(u.name);
      const uLast = normalizeText(u.surname);
      const full = `${uFirst} ${uLast}`.trim();
      const uFarm = normalizeText(u.farmName);
      const uCallsign = normalizeText(u.callsign);

      return (
        full.includes(normQuery) ||
        uFarm.includes(normQuery) ||
        (uCallsign && uCallsign.includes(normQuery))
      );
    });
    if (substringMatch) return substringMatch;
  }

  // 8. Secondary phone fallback (even if query had text mixed with numbers)
  if (queryPhone.rawDigits.length >= 6) {
    const fallbackPhoneMatch = users.find((u) => isPhoneMatch(u, raw));
    if (fallbackPhoneMatch) return fallbackPhoneMatch;
  }

  return null;
}

/**
 * Searches users for live auto-suggestions on the login screen
 */
export function searchMembersForSuggestions(
  users: UserProfile[],
  query: string,
  limit: number = 6
): UserProfile[] {
  const raw = (query || '').trim();
  if (!raw || raw.length < 2) return [];

  const normQuery = normalizeText(raw);
  const queryTokens = normQuery.split(' ').filter(Boolean);
  const queryPhone = normalizePhone(raw);
  const isDigits = queryPhone.rawDigits.length >= 3;

  const results: { user: UserProfile; score: number }[] = [];

  for (const u of users) {
    let score = 0;
    const uFirst = normalizeText(u.name);
    const uLast = normalizeText(u.surname);
    const uFull = `${uFirst} ${uLast}`.trim();
    const uFarm = normalizeText(u.farmName);

    // Phone match
    if (isDigits && isPhoneMatch(u, raw)) {
      score += 100;
    } else if (isDigits && u.primaryPhone && u.primaryPhone.replace(/\D/g, '').includes(queryPhone.rawDigits)) {
      score += 60;
    }

    // Exact name match
    if (uFull === normQuery || uFirst === normQuery || uLast === normQuery) {
      score += 90;
    } else if (uFull.startsWith(normQuery) || uFirst.startsWith(normQuery) || uLast.startsWith(normQuery)) {
      score += 70;
    } else if (uFull.includes(normQuery)) {
      score += 50;
    }

    // Farm match
    if (uFarm && uFarm.includes(normQuery)) {
      score += 40;
    }

    // Token match
    if (queryTokens.length > 1) {
      const combined = `${uFirst} ${uLast} ${uFarm}`;
      const allTokensMatch = queryTokens.every((t) => combined.includes(t));
      if (allTokensMatch) {
        score += 65;
      }
    }

    if (score > 0) {
      results.push({ user: u, score });
    }
  }

  // Sort highest score first, then alphabetically by name
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return `${a.user.name} ${a.user.surname}`.localeCompare(`${b.user.name} ${b.user.surname}`);
  });

  return results.slice(0, limit).map((r) => r.user);
}
