type UserPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserProfile({ params }: UserPageProps) {
  const { id } = await params;

  return (
    <main style={{ padding: "20px" }}>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
    </main>
  );
}
