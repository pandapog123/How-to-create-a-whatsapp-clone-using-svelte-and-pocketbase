import { validateUser } from "$lib/types.js";
import { redirect } from "@sveltejs/kit";

export const actions = {
  updateUserInformation: async ({ request, locals }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    try {
      const formData = await request.formData();

      const name = formData.get("name");
      const photo = formData.get("photo");

      if (typeof name !== "string") {
        throw new Error(`Invalid name`);
      }

      if (name.length < 1) {
        throw new Error(`Invalid name`);
      }

      if (!(photo instanceof File)) {
        throw new Error(`Invalid photo`);
      }

      let updateObj: Record<string, any> = {
        name,
      };

      if (photo.size > 0) {
        updateObj.photo = photo;
      }

      await locals.pocketBase
        .collection("users")
        .update(authModel.id, updateObj)
        .catch(console.error);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: error.message,
        };
      }
      return {
        error: "Unknown error occured when updating profile",
      };
    }

    throw redirect(303, "/");
  },
};
