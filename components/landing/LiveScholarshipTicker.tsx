import { db } from '@/db'
import { scholarships } from '@/db/schema'
import { and, eq, gte, isNotNull, asc } from 'drizzle-orm'
import LiveScholarshipTickerClient, {
  type TickerTile,
} from './LiveScholarshipTickerClient'

const SAMPLE_TILES: TickerTile[] = [
  { id: 's1',  name: 'Coca-Cola Scholars Program',         amount: '$20,000', deadline: 'Oct 31',  ev: '7.8' },
  { id: 's2',  name: 'Gates Scholarship',                  amount: '$45,000', deadline: 'Sep 15',  ev: '9.2' },
  { id: 's3',  name: 'Jack Kent Cooke Foundation',         amount: '$40,000', deadline: 'Nov 19',  ev: '8.6' },
  { id: 's4',  name: 'Elks Most Valuable Student',         amount: '$12,500', deadline: 'Nov 15',  ev: '6.4' },
  { id: 's5',  name: 'Davidson Fellows Scholarship',       amount: '$50,000', deadline: 'Feb 14',  ev: '8.9' },
  { id: 's6',  name: 'Regeneron Science Talent Search',    amount: '$250,000',deadline: 'Nov 8',   ev: '9.4' },
  { id: 's7',  name: 'Horatio Alger Scholarship',          amount: '$25,000', deadline: 'Oct 25',  ev: '7.2' },
  { id: 's8',  name: 'Burger King Scholars',               amount: '$1,000',  deadline: 'Dec 15',  ev: '5.1' },
  { id: 's9',  name: 'Dell Scholars Program',              amount: '$20,000', deadline: 'Dec 1',   ev: '7.6' },
  { id: 's10', name: 'Ron Brown Scholar Program',          amount: '$40,000', deadline: 'Jan 9',   ev: '8.0' },
  { id: 's11', name: 'QuestBridge National College Match', amount: 'Full ride',deadline: 'Sep 26', ev: '9.1' },
  { id: 's12', name: 'Hispanic Scholarship Fund',          amount: '$5,000',  deadline: 'Feb 15',  ev: '6.2' },
  { id: 's13', name: 'APIASF Scholarship',                 amount: '$20,000', deadline: 'Jan 17',  ev: '6.9' },
  { id: 's14', name: 'Gloria Barron Prize',                amount: '$10,000', deadline: 'Apr 15',  ev: '6.0' },
  { id: 's15', name: 'Stephen J. Brady Stop Hunger',       amount: '$5,000',  deadline: 'Dec 5',   ev: '5.4' },
  { id: 's16', name: 'Prudential Emerging Visionaries',    amount: '$10,000', deadline: 'Nov 5',   ev: '6.1' },
  { id: 's17', name: 'National Merit Scholarship',         amount: '$2,500',  deadline: 'Oct 14',  ev: '7.9' },
  { id: 's18', name: 'Voice of Democracy (VFW)',           amount: '$35,000', deadline: 'Oct 31',  ev: '6.6' },
  { id: 's19', name: 'Ayn Rand Essay Contest',             amount: '$10,000', deadline: 'Apr 22',  ev: '5.8' },
  { id: 's20', name: 'John F. Kennedy Profile in Courage', amount: '$10,000', deadline: 'Jan 14',  ev: '6.3' },
  { id: 's21', name: 'Doodle for Google',                  amount: '$30,000', deadline: 'Mar 18',  ev: '5.9' },
  { id: 's22', name: 'Scholastic Art & Writing Awards',    amount: '$12,500', deadline: 'Jan 8',   ev: '6.5' },
  { id: 's23', name: 'Intel ISEF',                         amount: '$75,000', deadline: 'Feb 12',  ev: '8.4' },
  { id: 's24', name: 'AXA Achievement Scholarship',        amount: '$25,000', deadline: 'Dec 15',  ev: '7.1' },
  { id: 's25', name: 'Foot Locker Scholar Athletes',       amount: '$20,000', deadline: 'Jan 10',  ev: '6.8' },
  { id: 's26', name: 'Courage to Grow Scholarship',        amount: '$500',    deadline: 'Monthly', ev: '4.2' },
  { id: 's27', name: 'Unigo $10K Scholarship',             amount: '$10,000', deadline: 'Dec 31',  ev: '5.6' },
  { id: 's28', name: 'Fastweb Make College Affordable',    amount: '$5,000',  deadline: 'Sep 30',  ev: '5.3' },
  { id: 's29', name: 'Cameron Impact Scholarship',         amount: 'Full tuition', deadline: 'Nov 1', ev: '8.2' },
  { id: 's30', name: 'Fulbright Regional Awards',          amount: '$10,000', deadline: 'Mar 15',  ev: '7.0' },
]

function formatAmount(min: number | null, max: number | null): string {
  if (max && max > 0) return `$${max.toLocaleString()}`
  if (min && min > 0) return `$${min.toLocaleString()}`
  return 'Varies'
}

function formatDeadline(d: string | null): string {
  if (!d) return 'Rolling'
  const dt = new Date(d + 'T00:00:00')
  if (Number.isNaN(dt.getTime())) return 'Rolling'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function estimateEV(max: number | null, min: number | null): string {
  const amt = max ?? min ?? 1000
  const seeded = 4 + Math.min(5.4, Math.log10(Math.max(100, amt)))
  return seeded.toFixed(1)
}

async function fetchTiles(): Promise<TickerTile[]> {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const rows = await db
      .select({
        id: scholarships.id,
        name: scholarships.name,
        amountMin: scholarships.amountMin,
        amountMax: scholarships.amountMax,
        deadline: scholarships.deadline,
      })
      .from(scholarships)
      .where(
        and(
          eq(scholarships.isActive, true),
          isNotNull(scholarships.deadline),
          gte(scholarships.deadline, today),
        ),
      )
      .orderBy(asc(scholarships.deadline))
      .limit(30)

    if (!rows.length) return SAMPLE_TILES

    return rows.map((r): TickerTile => ({
      id: String(r.id),
      name: r.name,
      amount: formatAmount(r.amountMin, r.amountMax),
      deadline: formatDeadline(r.deadline),
      ev: estimateEV(r.amountMax, r.amountMin),
    }))
  } catch {
    return SAMPLE_TILES
  }
}

export default async function LiveScholarshipTicker() {
  const tiles = await fetchTiles()
  return <LiveScholarshipTickerClient tiles={tiles} />
}
