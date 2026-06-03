import type { ReportPreviewModel } from "@/features/reports/utils/reportPreview";

interface ReportPrintDocumentProps {
  preview: ReportPreviewModel;
}

export function ReportPrintDocument({ preview }: ReportPrintDocumentProps) {
  return (
    <article className="report-print-root">
      <header className="report-print-header">
        <p className="report-print-brand">UCLV Residencias</p>
        <h1 className="report-print-title">{preview.title}</h1>
        <p className="report-print-meta">
          <span>{preview.typeLabel}</span>
          <span aria-hidden="true"> · </span>
          <span>{preview.generatedAtLabel}</span>
        </p>
      </header>

      <section className="report-print-section">
        <h2 className="report-print-section-title">Filtros aplicados</h2>
        <dl className="report-print-filters">
          {preview.filterSummary.map((line) => {
            const [label, ...rest] = line.split(": ");
            const value = rest.join(": ");
            return (
              <div key={line} className="report-print-filter-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      {preview.insights.length > 0 ? (
        <section className="report-print-section">
          <h2 className="report-print-section-title">Indicadores clave</h2>
          <div className="report-print-insights">
            {preview.insights.map((insight) => (
              <div key={insight.id} className="report-print-insight-card">
                <p className="report-print-insight-label">{insight.label}</p>
                <p className="report-print-insight-value">{insight.value}</p>
                {insight.hint ? <p className="report-print-insight-hint">{insight.hint}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="report-print-section">
        <h2 className="report-print-section-title">Resumen ejecutivo</h2>
        <div className="report-print-metrics">
          {preview.metrics.map((metric) => (
            <div key={metric.label} className="report-print-metric-card">
              <p className="report-print-metric-label">{metric.label}</p>
              <p className="report-print-metric-value">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="report-print-section">
        <h2 className="report-print-section-title">Ocupación por edificio</h2>
        {preview.buildingRows.length === 0 ? (
          <p className="report-print-empty">Sin datos de ocupación para los filtros seleccionados.</p>
        ) : (
          <table className="report-print-table">
            <thead>
              <tr>
                <th>Edificio</th>
                <th>Ocupadas</th>
                <th>Capacidad</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {preview.buildingRows.map((row) => (
                <tr key={row.buildingId}>
                  <td>{row.label}</td>
                  <td>{row.occupied}</td>
                  <td>{row.capacity}</td>
                  <td className="report-print-strong">{row.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="report-print-section">
        <h2 className="report-print-section-title">Quejas — últimos 30 días</h2>
        <div className="report-print-complaints">
          <div>
            <span className="report-print-complaint-value">{preview.complaintBreakdown.pendiente}</span>
            <span className="report-print-complaint-label">Pendientes</span>
          </div>
          <div>
            <span className="report-print-complaint-value">{preview.complaintBreakdown.en_proceso}</span>
            <span className="report-print-complaint-label">En proceso</span>
          </div>
          <div>
            <span className="report-print-complaint-value">{preview.complaintBreakdown.resuelta}</span>
            <span className="report-print-complaint-label">Resueltas</span>
          </div>
          <div>
            <span className="report-print-complaint-value">{preview.complaintBreakdown.rechazada}</span>
            <span className="report-print-complaint-label">Rechazadas</span>
          </div>
        </div>
      </section>

      <section className="report-print-section report-print-section--break">
        <h2 className="report-print-section-title">
          Estudiantes ({preview.totalStudents} en total · muestra de {preview.studentRows.length})
        </h2>
        {preview.studentRows.length === 0 ? (
          <p className="report-print-empty">Sin estudiantes en el alcance definido.</p>
        ) : (
          <table className="report-print-table report-print-table--students">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Sede</th>
                <th>Edificio</th>
                <th>Fac.</th>
                <th>Eval.</th>
              </tr>
            </thead>
            <tbody>
              {preview.studentRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="report-print-strong">{row.fullName}</span>
                    <br />
                    <span className="report-print-sub">ID: {row.studentId}</span>
                  </td>
                  <td>{row.siteName}</td>
                  <td>{row.buildingName}</td>
                  <td>{row.facultyLabel}</td>
                  <td className="report-print-strong">{row.evaluationGrade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </article>
  );
}
