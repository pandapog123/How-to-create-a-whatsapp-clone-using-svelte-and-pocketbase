import { json, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.pocketBase.authStore.isValid) {
    return json({});
  }

  locals.pocketBase.authStore.clear();

  throw redirect(303, "signup");
};
