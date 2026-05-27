export default function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "120px 40px",
        background: "#ffffff",
      }}
    >
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-block",
            background: "#fee2e2",
            color: "#dc2626",
            padding: "8px 18px",
            borderRadius: "999px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          Powerful Features
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "16px",
            color: "#111",
          }}
        >
          Everything You Need to Save Lives
        </h2>

        <p
          style={{
            color: "#6b7280",
            fontSize: "18px",
            marginBottom: "60px",
          }}
        >
          A comprehensive platform designed for efficiency, safety, and impact.
        </p>

        {/* FEATURES GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "30px",
          }}
        >
          <FeatureCard
            title="Real-Time Matching"
            text="Instantly connect with compatible donors based on blood type, location, and availability."
            icon="🕒"
          />
          <FeatureCard
            title="Location-Based Search"
            text="Find nearby donors and blood banks using GPS-powered search."
            icon="📍"
            highlight
          />
          <FeatureCard
            title="Smart Notifications"
            text="Receive instant alerts for urgent requests matching your blood type."
            icon="🔔"
          />
          <FeatureCard
            title="Verified Donors"
            text="All donors are verified to ensure safety and reliability."
            icon="🛡️"
          />
          <FeatureCard
            title="Inventory Management"
            text="Hospitals can track and manage blood inventory in real-time."
            icon="📊"
          />
          <FeatureCard
            title="Mobile Friendly"
            text="Access from anywhere with our fully responsive platform."
            icon="📱"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  text,
  icon,
  highlight = false,
}: {
  title: string;
  text: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        textAlign: "left",
        padding: "32px",
        borderRadius: "18px",
        background: "#ffffff",
        border: highlight ? "2px solid #fecaca" : "1px solid #f3f4f6",
        boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "black",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      <p style={{ color: "#6b7280", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}
