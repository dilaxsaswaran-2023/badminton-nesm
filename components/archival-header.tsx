export function ArchivalHeader() {
  return (
    <header className="archival-header">
      <div className="monogram" aria-label="NESM 2026">
        <span className="monogram-kicker">EST.</span>
        <strong>N</strong>
        <span className="monogram-year">2026</span>
      </div>
      <div className="title-block">
        <p className="eyebrow">Nothern Engineers Shuttle Masters · Championship Office</p>
        <h1>NESM 2026 Badminton Championship</h1>
        <div className="title-rule" aria-hidden="true">
          <span />
          <i className="shuttle-mark" />
          <span />
        </div>
        <p className="subtitle">Official Knockout Draw Ledger</p>
      </div>
      <div className="header-folio">
        <span>Ledger No.</span>
        <strong>07 / 26</strong>
        <small>7 categories · Knockout format</small>
      </div>
    </header>
  );
}
