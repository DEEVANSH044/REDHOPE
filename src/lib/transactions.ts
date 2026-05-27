import { supabase } from "@/lib/supabase";

export async function createUserWithProfile() {
  try {
    // Note: This is not transactional in the same way as Prisma.
    // Supabase via client library does not support multi-statement transactions natively without RPC.

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        name: "Test Donor",
        email: "donor@redhope.com",
        password: "hashed_test_password",
      })
      .select()
      .single();

    if (userError) throw userError;

    const { error: profileError } = await supabase.from("Profile").insert({
      userId: user.id,
      bio: "",
    });

    if (profileError) throw profileError;

    return user;
  } catch (error) {
    console.error("Operation failed.", error);
    throw error;
  }
}
