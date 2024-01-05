import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { validateUser } from "$lib/types";

export const load = (async ({ locals }) => {
  const authModel = locals.pocketBase.authStore.model;

  if (!authModel) {
    redirect(303, "/signup");
  }

  if (!validateUser(authModel)) {
    redirect(303, "/signup");
  }
  return {
    authModel,
  };
}) satisfies LayoutServerLoad;
