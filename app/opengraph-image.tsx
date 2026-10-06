import { ImageResponse } from "next/og";
export const alt =
  "Teramis — CUI discovery, validation, remediation and monitoring";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function SocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#07111a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          color: "#fff",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 6,
            color: "#f1bd68",
          }}
        >
          TERAMIS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          <span>Mission-critical data.</span>
          <span style={{ color: "#f1bd68" }}>Total visibility.</span>
        </div>
        <div style={{ display: "flex", fontSize: 25, color: "#ced8e8" }}>
          DISCOVER / VALIDATE / REMEDIATE / MONITOR
        </div>
      </div>
    ),
    size,
  );
}
