import LiveScholarshipTickerClient, {
  type TickerTile,
} from './LiveScholarshipTickerClient'

// Hand-curated real scholarships. Deadlines intentionally omitted — they go stale.
const TILES: TickerTile[] = [
  { id: 't1',  name: 'Gates Scholarship',            amount: '$55,000', ev: '9.4' },
  { id: 't2',  name: 'Coca-Cola Scholars',           amount: '$20,000', ev: '8.9' },
  { id: 't3',  name: 'Jack Kent Cooke',              amount: '$55,000', ev: '9.2' },
  { id: 't4',  name: 'Elks MVS',                     amount: '$50,000', ev: '9.0' },
  { id: 't5',  name: 'Burger King Scholars',         amount: '$50,000', ev: '8.7' },
  { id: 't6',  name: 'Ron Brown Scholar',            amount: '$40,000', ev: '8.8' },
  { id: 't7',  name: 'Horatio Alger National',       amount: '$25,000', ev: '8.5' },
  { id: 't8',  name: 'Dell Scholars',                amount: '$20,000', ev: '8.6' },
  { id: 't9',  name: 'QuestBridge National Match',   amount: 'Full ride', ev: '9.5' },
  { id: 't10', name: 'Davidson Fellows',             amount: '$50,000', ev: '9.3' },
  { id: 't11', name: 'Regeneron STS',                amount: '$250,000', ev: '9.6' },
  { id: 't12', name: 'Cameron Impact Scholarship',   amount: 'Full ride', ev: '9.1' },
]

export default function LiveScholarshipTicker() {
  return <LiveScholarshipTickerClient tiles={TILES} />
}
