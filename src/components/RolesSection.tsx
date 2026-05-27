"use client";
import { useRouter } from "next/navigation";

export default function RolesSection() {
  const router = useRouter();

  return (
    <section
      id="roles"
      style={{
        padding: "120px 40px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
        }}
      >
        <RoleCard
          icon="👤"
          title="For Donors"
          text="Schedule donations, track your impact, and earn recognition badges for your life-saving contributions."
          onDonateNow={() => router.push("/login")}
        />

        <RoleCard
          icon="🏥"
          title="For Hospitals"
          text="Manage blood inventory, send urgent requests, and connect with a network of verified donors."
          onDonateNow={() => router.push("/login")}
        />

        <RoleCard
          icon="❤️"
          title="For NGOs"
          text="Organize donation camps, coordinate volunteer networks, and maximize community impact."
          onDonateNow={() => router.push("/login")}
        />
      </div>
    </section>
  );
}

function RoleCard({
  icon,
  title,
  text,
  onDonateNow,
}: {
  icon: string;
  title: string;
  text: string;
  onDonateNow: () => void;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #b91c1c, #dc2626)",
        color: "white",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 25px 50px rgba(220,38,38,0.25)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 35px 60px rgba(220,38,38,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 25px 50px rgba(220,38,38,0.25)";
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          marginBottom: "20px",
        }}
      >
        {icon}
      </div>

      <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "14px" }}>
        {title}
      </h3>

      <p
        style={{
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.9)",
          marginBottom: "20px",
          flex: 1,
        }}
      >
        {text}
      </p>

      <button
        onClick={onDonateNow}
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.3)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
        }}
      >
        Donate Now
      </button>
    </div>
  );
}
