export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "100px 40px",
        background: "linear-gradient(to bottom, #ffffff, #fff1f2)",
      }}
    >
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "6px 14px",
            borderRadius: "999px",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          Simple Process
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: "40px",
            fontWeight: 800,
            marginBottom: "12px",
            color: "black",
          }}
        >
          How redhope Works
        </h2>

        {/* Subtext */}
        <p
          style={{
            color: "#6b7280",
            maxWidth: "600px",
            margin: "0 auto 60px",
            fontSize: "18px",
          }}
        >
          We&apos;ve simplified the blood donation process to make saving lives
          as easy as possible.
        </p>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
          }}
        >
          <Step
            number="1"
            title="Register"
            text="Create your profile as a donor, hospital, or NGO in under 2 minutes."
          />
          <Step
            number="2"
            title="Find or Request"
            text="Search for available blood or post an urgent request in real-time."
          />
          <Step
            number="3"
            title="Connect & Donate"
            text="Get matched with nearby donors or recipients instantly."
          />
          <Step
            number="4"
            title="Save Lives"
            text="Complete the donation and track your life-saving impact."
          />
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        textAlign: "left",
        position: "relative",
      }}
    >
      {/* Step Number Bubble */}
      <div
        style={{
          position: "absolute",
          top: "-14px",
          left: "-14px",
          backgroundColor: "#dc2626",
          color: "white",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {number}
      </div>

      <h3
        style={{
          fontSize: "20px",
          color: "black",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "#6b7280", fontSize: "15px" }}>{text}</p>
    </div>
  );
}
