export const REPORT_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 16mm 14mm;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #191c1e;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .report-print-root {
    max-width: 100%;
  }

  .report-print-header {
    border-bottom: 2px solid #1d4ed8;
    padding-bottom: 14px;
    margin-bottom: 22px;
    page-break-after: avoid;
  }

  .report-print-brand {
    margin: 0 0 6px;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #1d4ed8;
  }

  .report-print-title {
    margin: 0;
    font-size: 20pt;
    font-weight: 800;
    line-height: 1.2;
    color: #1e3a8a;
  }

  .report-print-meta {
    margin: 8px 0 0;
    font-size: 9.5pt;
    color: #434655;
  }

  .report-print-section {
    margin-bottom: 22px;
    page-break-inside: avoid;
  }

  .report-print-section--break {
    page-break-before: auto;
  }

  .report-print-section-title {
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e0e3e5;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #434655;
  }

  .report-print-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 20px;
    margin: 0;
  }

  .report-print-filter-row {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 8px;
    margin: 0;
  }

  .report-print-filter-row dt {
    margin: 0;
    font-size: 8.5pt;
    font-weight: 600;
    color: #747686;
  }

  .report-print-filter-row dd {
    margin: 0;
    font-weight: 600;
    color: #191c1e;
  }

  .report-print-insights {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .report-print-insight-card {
    border: 1px solid #e0e3e5;
    border-radius: 8px;
    padding: 10px 12px;
    background: #f7f9fb;
    page-break-inside: avoid;
  }

  .report-print-insight-label {
    margin: 0;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #747686;
  }

  .report-print-insight-value {
    margin: 4px 0 0;
    font-size: 16pt;
    font-weight: 800;
    color: #1d4ed8;
    line-height: 1.1;
  }

  .report-print-insight-hint {
    margin: 4px 0 0;
    font-size: 8pt;
    color: #434655;
  }

  .report-print-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .report-print-metric-card {
    border: 1px solid #e0e3e5;
    border-radius: 8px;
    padding: 10px 12px;
    background: #f2f4f6;
    page-break-inside: avoid;
  }

  .report-print-metric-label {
    margin: 0;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #747686;
    line-height: 1.3;
  }

  .report-print-metric-value {
    margin: 6px 0 0;
    font-size: 14pt;
    font-weight: 800;
    color: #191c1e;
  }

  .report-print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
  }

  .report-print-table th {
    text-align: left;
    padding: 8px 10px;
    background: #eceef0;
    border: 1px solid #d0d3d8;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #434655;
  }

  .report-print-table td {
    padding: 7px 10px;
    border: 1px solid #e0e3e5;
    vertical-align: top;
  }

  .report-print-table tbody tr:nth-child(even) td {
    background: #fafbfc;
  }

  .report-print-table--students td {
    font-size: 8.5pt;
  }

  .report-print-complaints {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .report-print-complaints > div {
    text-align: center;
    padding: 12px 8px;
    border: 1px solid #e0e3e5;
    border-radius: 8px;
    background: #f7f9fb;
  }

  .report-print-complaint-value {
    display: block;
    font-size: 18pt;
    font-weight: 800;
    color: #1d4ed8;
    line-height: 1.1;
  }

  .report-print-complaint-label {
    display: block;
    margin-top: 4px;
    font-size: 8pt;
    font-weight: 600;
    color: #434655;
  }

  .report-print-strong {
    font-weight: 700;
    color: #1d4ed8;
  }

  .report-print-sub {
    font-size: 7.5pt;
    color: #747686;
  }

  .report-print-empty {
    margin: 0;
    color: #747686;
    font-style: italic;
  }

  thead {
    display: table-header-group;
  }

  tr {
    page-break-inside: avoid;
  }
`;
