import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_PASSWORD = "bolec2008";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { password, action } = body;

    if (password !== ADMIN_PASSWORD) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (action) {
      case "list-staff": {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "staff")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return jsonResponse({ data });
      }

      case "create-staff": {
        const { name, email, staffPassword } = body;
        if (!name || !email || !staffPassword) {
          return jsonResponse(
            { error: "Name, email, and password are required" },
            400
          );
        }

        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("email", email.toLowerCase())
          .maybeSingle();

        if (existing) {
          return jsonResponse({ error: "Email already exists" }, 400);
        }

        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: email.toLowerCase(),
            password: staffPassword,
            email_confirm: true,
          });

        if (authError) throw authError;

        const staffId = `STAFF${Math.floor(100000 + Math.random() * 900000)}`;

        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert({
            auth_user_id: authData.user.id,
            user_id: staffId,
            name,
            email: email.toLowerCase(),
            role: "staff",
            token_balance: 0,
            total_tokens_earned: 0,
            total_spent: 0,
            member_since: new Date().toISOString().split("T")[0],
            email_verified: true,
          })
          .select()
          .single();

        if (userError) {
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw userError;
        }

        return jsonResponse({ data: userData });
      }

      case "remove-staff": {
        const { staffId } = body;

        if (!staffId) {
          return jsonResponse({ error: "Staff ID is required" }, 400);
        }

        const { data: staff, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", staffId)
          .eq("role", "staff")
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!staff) {
          return jsonResponse({ error: "Staff member not found" }, 404);
        }

        const { error: deleteError } = await supabase
          .from("users")
          .delete()
          .eq("id", staffId);

        if (deleteError) throw deleteError;

        if (staff.auth_user_id) {
          await supabase.auth.admin.deleteUser(staff.auth_user_id);
        }

        return jsonResponse({ success: true });
      }

      case "list-activity": {
        const { staffId: filterStaffId, limit: activityLimit } = body;

        let query = supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(activityLimit || 200);

        if (filterStaffId) {
          query = query.eq("staff_id", filterStaffId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const staffIds = [
          ...new Set((data || []).map((a: Record<string, unknown>) => a.staff_id)),
        ];

        const { data: staffMembers } = await supabase
          .from("users")
          .select("id, name")
          .in("id", staffIds);

        const staffMap = new Map(
          (staffMembers || []).map((s: Record<string, unknown>) => [s.id, s.name])
        );

        const enrichedData = (data || []).map((a: Record<string, unknown>) => ({
          ...a,
          staff_name: staffMap.get(a.staff_id as string) || "Unknown",
        }));

        return jsonResponse({ data: enrichedData });
      }

      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
});
