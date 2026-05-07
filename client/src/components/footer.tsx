import { useLocation } from "wouter";
import pskShield from "@/assets/psk-shield.png";

export function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer style={{ background: "#FAF7F2", borderTop: "1px solid #E8E8E8", padding: "32px 0", marginTop: "auto" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <button onClick={() => setLocation("/terms")} className="text-sm hover:underline" style={{ color: "#646569", background: "none", border: "none", cursor: "pointer", fontFamily: "'Open Sans', sans-serif" }}>
              Terms & Conditions
            </button>
            <button onClick={() => setLocation("/privacy")} className="text-sm hover:underline" style={{ color: "#646569", background: "none", border: "none", cursor: "pointer", fontFamily: "'Open Sans', sans-serif" }}>
              Privacy Policy
            </button>
            <a href="https://phisigmakappa.org" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#646569", textDecoration: "none", fontFamily: "'Open Sans', sans-serif" }}>
              Chapter Information
            </a>
            <a href="https://www.instagram.com/phisigmakappa/" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#646569", textDecoration: "none", fontFamily: "'Open Sans', sans-serif" }}>
              Instagram
            </a>
            <a href="https://www.facebook.com/phisigmakappa" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#646569", textDecoration: "none", fontFamily: "'Open Sans', sans-serif" }}>
              Facebook
            </a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4" style={{ borderTop: "1px solid #E8E8E8" }}>
          <div className="flex items-center gap-3">
            <img src={pskShield} alt="Phi Sigma Kappa Fraternity" style={{ height: 36 }} />
            <div className="flex flex-col">
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#1A1A1A", fontWeight: 600 }}>Phi Sigma Kappa Fraternity</span>
              <span style={{ fontSize: 11, color: "#646569", fontFamily: "'Open Sans', sans-serif" }}>© 2026 Phi Sigma Kappa Fraternity · A Family of Leaders</span>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "#8B0E27",
              fontFamily: "'Open Sans', sans-serif",
              fontVariant: "small-caps",
              letterSpacing: 1.5,
              fontWeight: 600,
            }}
          >
            Powered by JIE Mastery.ai
          </span>
        </div>
      </div>
    </footer>
  );
}
