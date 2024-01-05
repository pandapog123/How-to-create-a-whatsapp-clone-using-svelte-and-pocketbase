import { redirect } from "@sveltejs/kit";
import { ClientResponseError } from "pocketbase";

export const actions = {
  default: async ({ request, locals }) => {
    if (locals.pocketBase.authStore.isValid) {
      return;
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (typeof name !== "string") {
        throw new Error("Name must be a string");
      }

      if (name.length === 0) {
        throw new Error("Please enter a valid name");
      }

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

      const usersCollection = locals.pocketBase.collection("users");

      const result = await usersCollection
        .getFirstListItem(`name="${name}"`)
        .catch((err) => {
          if (err instanceof ClientResponseError) {
            if (err.status === 404) {
              return undefined;
            }
          }

          throw err;
        });

      if (result) {
        throw new Error("Name is already taken");
      }

      await usersCollection.create({
        email,
        password,
        name,
        passwordConfirm: password,
        emailVisibility: true,
      });

      await locals.pocketBase
        .collection("users")
        .authWithPassword(email, password);
    } catch (error) {
      console.error(error);

      if (!(error instanceof Error)) {
        return {
          name,
          email,
          password,
          error: "Unknown error occured when signing up user",
        };
      }

      return { error: error.message, name, email, password };
    }

    redirect(303, "/");
  },
};
