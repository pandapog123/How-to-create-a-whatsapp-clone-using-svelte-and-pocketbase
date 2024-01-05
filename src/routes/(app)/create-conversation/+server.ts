import { error, json, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { validateUser, type User, type Conversation } from "$lib/types";
import type { RecordModel } from "pocketbase";

export const POST: RequestHandler = async ({ locals, request }) => {
  const authModel = locals.pocketBase.authStore.model;

  if (!(authModel && validateUser(authModel))) {
    throw redirect(303, "/signup");
  }

  try {
    const jsonData = await request.json();

    const selectedUsers = jsonData.selectedUsers;

    if (!Array.isArray(selectedUsers)) {
      throw new Error("Parameter selectedUsers must be an array");
    }

    if (selectedUsers.length > 4) {
      throw new Error("A conversation cannot have more than 5 members");
    }

    let validatedSelectedUsers: User[] = [authModel];

    for (const item of selectedUsers) {
      if (validateUser(item)) {
        validatedSelectedUsers.push(item);
      } else {
        throw new Error("An item in the selectedUsers array was not a user");
      }
    }

    let validationString = validatedSelectedUsers.reduce(
      (previousValue: string, currentUser) => {
        if (previousValue) {
          return `${previousValue} || id = "${currentUser.id}"`;
        }

        return `id = "${currentUser.id}"`;
      },
      ""
    );

    const validationResult = await locals.pocketBase
      .collection("users")
      .getFullList<RecordModel & User>({
        filter: validationString,
      });

    let members: string[] = [];
    let admins: string[] = [];
    let conversationName = "";

    for (let i = 0; i < validatedSelectedUsers.length; i++) {
      let user = validatedSelectedUsers[i];

      if (!validationResult.find((item) => item.id === user.id)) {
        throw new Error("A user that you provided does not exist");
      }

      members.push(user.id);

      if (i === 0) {
        conversationName = user.name;
      } else {
        conversationName = `${conversationName}, ${user.name}`;
      }

      if (user.id === authModel.id) {
        admins.push(user.id);
      }
    }

    await locals.pocketBase
      .collection("conversations")
      .create<RecordModel & Conversation>({
        name: conversationName,
        messages: [],
        members,
        admins,
      });

    return json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      error(400, err.message);
    }

    error(400, "Unknown error occured when creating conversation");
  }
};
