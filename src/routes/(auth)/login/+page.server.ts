import { redirect } from "@sveltejs/kit";

export const actions = {
  default: async ({ locals, request }) => {
    if (locals.pocketBase.authStore.isValid) {
      return;
    }

    const formData = await request.formData();

    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (typeof email !== "string") {
        throw new Error("Email must be a string");
      }

      if (email.length < 5) {
        throw new Error("Please enter a valid e-mail address");
      }

      if (typeof password !== "string") {
        throw new Error("Password must be a string");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters in length");
      }

      await locals.pocketBase
        .collection("users")
        .authWithPassword(email, password);
    } catch (error) {
      console.error(error);

      if (!(error instanceof Error)) {
        return {
          email,
          password,
          error: "Unknown error occured when signing up user",
        };
      }

      return { error: error.message, email, password };
    }

    redirect(303, "/");
  },
};
