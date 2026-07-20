import { useLocation } from 'react-router-dom';

const SupplyChainPage = () => {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean).pop() || 'overview';

  const config = {
    overview: {
      title: 'Supply Chain Control Tower',
      subtitle: 'Coordinate planning, purchasing, logistics, and supplier operations from one workspace.',
    },
    planning: {
      title: 'Planning & Forecasting',
      subtitle: 'Balance demand, inventory levels, and replenishment priorities.',
    },
    procurement: {
      title: 'Procurement',
      subtitle: 'Track purchase requests, supplier commitments, and approvals.',
    },
    orders: {
      title: 'Orders & Fulfillment',
      subtitle: 'Monitor outbound orders, promise dates, and fulfillment health.',
    },
    logistics: {
      title: 'Logistics',
      subtitle: 'Review transport readiness, lead times, and shipment visibility.',
    },
    vendors: {
      title: 'Vendors & Partners',
      subtitle: 'Manage supplier performance, scorecards, and collaboration.',
    },
    reports: {
      title: 'Supply Chain Reports',
      subtitle: 'Analyze service levels, OTIF performance, and exception trends.',
    },
  };

  const current = config[segment] || config.overview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{current.title}</h1>
          <p className="page-subtitle">{current.subtitle}</p>
        </div>
        <span className="badge">ERP module</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          ['On-time Fulfillment', '92%'],
          ['Open Orders', '18'],
          ['Supplier Risk', '3 alerts'],
          ['Lead Time', '4.8 days'],
        ].map(([label, value]) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>What’s included</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          This workspace is ready for planning, purchasing, fulfillment, partner management, and reporting workflows as the supply chain module expands.
        </p>
      </div>
    </div>
  );
};

export default SupplyChainPage;
