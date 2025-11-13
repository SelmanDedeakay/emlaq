import { Property, Customer } from '../types';

type MatchResult = {
	id: string;
	score: number; // 0-100
	matchedCriteria: string[];
	unmatchedCriteria: string[];
};

function parseRooms(room: string) {
	const parts = room.split('+');
	const num = parseInt(parts[0], 10);
	return isNaN(num) ? 0 : num;
}

export function matchPropertyToCustomers(property: Partial<Property>, customers: Partial<Customer>[]): MatchResult[] {
	const results: MatchResult[] = [];

	for (const c of customers) {
		const id = c.id ?? 'unknown';
		const criteria = (c as Customer).criteria;
		const matched: string[] = [];
		const unmatched: string[] = [];
		let score = 0;

		// Weight distribution (sum 100)
		const weights = {
			status: 20,
			type: 15,
			location: 20,
			budget: 20,
			rooms: 10,
			features: 15,
		} as const;

		// Status
		if (criteria?.status && property.status === criteria.status) {
			score += weights.status;
			matched.push('İlan Tipi');
		} else {
			unmatched.push('İlan Tipi');
		}

		// Type
		if (criteria?.types && Array.isArray(criteria.types) && property.type && criteria.types.includes(property.type)) {
			score += weights.type;
			matched.push('Emlak Tipi');
		} else {
			unmatched.push('Emlak Tipi');
		}

		// Location (il, ilce, mahalleler)
		let locationScore = 0;
		if (criteria?.location && property.location) {
			if (criteria.location.il && criteria.location.il === property.location.il) locationScore += 5;
			if (criteria.location.ilce && criteria.location.ilce === property.location.ilce) locationScore += 7;
			if (Array.isArray(criteria.location.mahalleler) && property.location.mahalle) {
				if (criteria.location.mahalleler.includes(property.location.mahalle)) locationScore += 8;
			}
		}
		score += Math.round((locationScore / 20) * weights.location);
		if (locationScore > 0) matched.push('Konum'); else unmatched.push('Konum');

		// Budget
		if (criteria?.budget && typeof property.price === 'number') {
			const min = criteria.budget.min ?? 0;
			const max = criteria.budget.max ?? Number.MAX_SAFE_INTEGER;
			if (property.price >= min && property.price <= max) {
				score += weights.budget;
				matched.push('Bütçe');
			} else {
				// partial: if within 10% of bounds
				const lowerDiff = Math.abs(property.price - min) / Math.max(1, min);
				const upperDiff = Math.abs(property.price - max) / Math.max(1, max);
				if (lowerDiff <= 0.1 || upperDiff <= 0.1) {
					score += Math.round(weights.budget / 2);
					unmatched.push('Bütçe (yakın)');
				} else {
					unmatched.push('Bütçe');
				}
			}
		} else {
			unmatched.push('Bütçe');
		}

		// Rooms
		if (criteria?.details?.minRooms && property.details?.rooms) {
			const propRooms = parseRooms(property.details.rooms as unknown as string);
			const minRooms = parseRooms(criteria.details.minRooms as unknown as string);
			if (propRooms >= minRooms) {
				score += weights.rooms;
				matched.push('Oda Sayısı');
			} else {
				unmatched.push('Oda Sayısı');
			}
		} else {
			unmatched.push('Oda Sayısı');
		}

		// Features - compare boolean features and give proportional points
		const featureKeys: Array<keyof Property['features']> = ['balcony', 'parking', 'inComplex', 'furnished', 'newBuilding'];
		let featureMatches = 0;
		let featureTotal = 0;
		if (criteria?.features) {
			for (const key of featureKeys) {
				const want = (criteria.features as any)[key];
				if (typeof want === 'boolean') {
					featureTotal += 1;
					if ((property.features as any)?.[key] === want) featureMatches += 1;
				}
			}
		}
		if (featureTotal > 0) {
			const featurePoints = Math.round((featureMatches / featureTotal) * weights.features);
			score += featurePoints;
			if (featureMatches > 0) matched.push('Özellikler'); else unmatched.push('Özellikler');
		} else {
			unmatched.push('Özellikler');
		}

		// Clamp score
		if (score > 100) score = 100;
		if (score < 0) score = 0;

		results.push({ id, score, matchedCriteria: matched, unmatchedCriteria: unmatched });
	}

	// sort descending by score
	return results.sort((a, b) => b.score - a.score);
}

export default matchPropertyToCustomers;

