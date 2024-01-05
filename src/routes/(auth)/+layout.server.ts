import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  if (locals.pocketBase.authStore.isValid) {
    redirect(303, "/");
  }

  return {};
}) satisfies LayoutServerLoad;
