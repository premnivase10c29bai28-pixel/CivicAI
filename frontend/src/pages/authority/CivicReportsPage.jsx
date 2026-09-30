import React, { useState } from "react";
import { FileSpreadsheet, Download, Calendar, Filter, Sparkles, CheckCircle2, Eye, FileText } from "lucide-react";
import { useCivicData } from "../../context/CivicDataContext";

export default function CivicReportsPage() {
  const { showToast } = useCivicData();

  const [reports, setReports] = useState([
    {
      id: "REP-2026-W39",
      title: "Weekly Zonal Municipal Triage & SLA Summary",
      period: "Sep 21, 2026 – Sep 27, 2026",
      type: "Weekly Digest",
      author: "CivicAI Central Engine",
      format: "PDF (2.4 MB)",
      status: "Finalized"
    },
    {
      id: "REP-2026-HSP-09",
      title: "Ward 12 & Ward 8 Multi-Cluster Infrastructure Audit",
      period: "Sep 15, 2026 – Sep 28, 2026",
      type: "Hotspot Investigation",
      author: "Zonal Operations Directorate",
      format: "PDF (4.1 MB)",
      status: "Published"
    },
    {
      id: "REP-2026-SLA-08",
      title: "CMWSSB & Roads Division Monthly SLA Adherence",
      period: "Aug 01, 2026 – Aug 31, 2026",
      type: "Departmental Audit",
      author: "Quality & Compliance Cell",
      format: "CSV (820 KB)",
      status: "Archived"
    },
    {
      id: "REP-2026-LNG-02",
      title: "Tamil Multilingual Dialect Recognition Accuracy Log",
      period: "Jul 01, 2026 – Sep 20, 2026",
      type: "AI Performance Review",
      author: "CivicAI Research Unit",
      format: "PDF (1.8 MB)",
      status: "Published"
    }
  ]);

  const handleDownload = (rep) => {
    showToast(`Downloading official report: ${rep.title}`, "success");
  };

  const handleGenerateNew = () => {
    const newRep = {
      id: `REP-2026-NEW-${Math.floor(100 + Math.random() * 900)}`,
      title: "Ad-Hoc Zonal Emergency Water Grid Audit",
      period: "Last 72 Hours (Real-Time)",
      type: "Emergency Hotspot",
      author: "CivicAI Auto-Compiler",
      format: "PDF (1.2 MB)",
      status: "Generated Just Now"
    };
    setReports([newRep, ...reports]);
    showToast("Generated new real-time civic report successfully!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Civic Reports & Audit Logs</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Certified municipal reports, automated weekly digests, and cross-departmental audit trails.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleGenerateNew}>
          <Sparkles size={16} />
          <span>Compile Real-Time Report</span>
        </button>
      </div>

      {/* Reports Table Card */}
      <div className="card">
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>
          Certified Municipal Publications
        </h3>

        <div className="table-responsive">
          <table className="civic-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Title & Topic</th>
                <th>Coverage Period</th>
                <th>Classification</th>
                <th>Format</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rep) => (
                <tr key={rep.id}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)", fontSize: "0.85rem" }}>
                      {rep.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                      {rep.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Compiled by: {rep.author}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.825rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {rep.period}
                  </td>
                  <td>
                    <span className="badge badge-received" style={{ fontSize: "0.72rem" }}>
                      {rep.type}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                    {rep.format}
                  </td>
                  <td>
                    <span className="badge badge-resolved" style={{ fontSize: "0.72rem" }}>
                      {rep.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownload(rep)}
                      style={{ fontSize: "0.78rem" }}
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
