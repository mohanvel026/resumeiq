export const getStyles = (dark) => ({
  card: {
    background: dark ? '#1E293B' : '#FFFFFF',
    border: `1px solid ${dark ? '#334155' : '#E9ECEF'}`,
    borderRadius: '12px',
    padding: '1.5rem',
    color: dark ? '#CBD5E1' : '#495057',
  },
  heading: {
    color: dark ? '#F1F5F9' : '#0D1F3C',
  },
  subtext: {
    color: dark ? '#94A3B8' : '#6C757D',
  },
  body: {
    color: dark ? '#CBD5E1' : '#495057',
  },
  input: {
    background: dark ? '#0F172A' : '#FFFFFF',
    border: `1px solid ${dark ? '#334155' : '#DEE2E6'}`,
    color: dark ? '#E2E8F0' : '#212529',
    borderRadius: '8px',
    padding: '10px 14px',
    width: '100%',
    fontSize: '0.9375rem',
    outline: 'none',
  },
  table: {
    background: dark ? '#1E293B' : '#FFFFFF',
    color: dark ? '#CBD5E1' : '#495057',
  },
  tableHead: {
    background: dark ? '#020817' : '#0A1628',
    color: '#C9A84C',
  },
  tableRow: {
    background: dark ? '#1E293B' : '#FFFFFF',
    borderColor: dark ? '#334155' : '#E9ECEF',
  },
  muted: {
    color: dark ? '#64748B' : '#ADB5BD',
  },
  border: dark ? '#334155' : '#E9ECEF',
  bg: dark ? '#0F172A' : '#F8F9FA',
  bgCard: dark ? '#1E293B' : '#FFFFFF',
  textPrimary: dark ? '#F1F5F9' : '#0D1F3C',
  textSecondary: dark ? '#94A3B8' : '#6C757D',
  textBody: dark ? '#CBD5E1' : '#495057',
})