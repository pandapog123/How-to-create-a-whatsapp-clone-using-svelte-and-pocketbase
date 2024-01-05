import { validateUser, type Conversation, type Message } from "$lib/types.js";
import { fail, redirect } from "@sveltejs/kit";
import { v4 as uuid } from "uuid";
import type { RecordModel } from "pocketbase";

export const actions = {
  sendMessage: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    const messageContent = formData.get("message");

    try {
      if (typeof messageContent !== "string") {
        throw new Error(`Invalid message`);
      }

      if (messageContent.length === 0) {
        throw new Error(`Invalid message`);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      const message: Message = {
        content: messageContent,
        contentType: "message",
        user_id: authModel.id,
        created: new Date().toISOString(),
        id: uuid(),
      };

      if (conversation.messages.length >= 50) {
        conversation.messages = [
          message,
          ...conversation.messages.slice(0, 50),
        ];
      } else {
        conversation.messages = [message, ...conversation.messages];
      }

      await conversationsCollection.update(conversation.id, {
        messages: conversation.messages,
      });
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }

      return { error: "Unknown error occured when sending message" };
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
  sendImage: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    const photo = formData.get("photo");

    console.log(photo);

    try {
      if (!(photo instanceof File)) {
        throw new Error(`Invalid message`);
      }

      if (photo.size === 0) {
        throw new Error(`Invalid message`);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      const result: Conversation & RecordModel =
        await conversationsCollection.update(conversation.id, {
          message_photos: photo,
        });

      if (!result.message_photos) {
        throw new Error(`Error occured when uploading image`);
      }

      const message: Message = {
        content: result.message_photos[result.message_photos.length - 1],
        contentType: "image",
        user_id: authModel.id,
        created: new Date().toISOString(),
        id: uuid(),
      };

      if (conversation.messages.length >= 50) {
        conversation.messages = [
          message,
          ...conversation.messages.slice(0, 50),
        ];
      } else {
        conversation.messages = [message, ...conversation.messages];
      }

      await conversationsCollection.update(conversation.id, {
        messages: conversation.messages,
      });
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }

      return { error: "Unknown error occured when sending message" };
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
  leaveConversation: async ({ locals, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    try {
      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      const members = conversation.members.filter(
        (member) => member !== authModel.id
      );

      if (members.length < 2) {
        await conversationsCollection.delete(conversation.id);

        return;
      }

      await conversationsCollection.update(conversation.id, {
        members,
      });
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }

      return { error: "Unknown error occured when sending message" };
    }

    return redirect(303, "/");
  },
  deleteConversation: async ({ locals, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    try {
      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      let isAdmin = conversation.admins.includes(authModel.id);

      if (!isAdmin) {
        throw new Error(`User is not admin`);
      }

      await conversationsCollection.delete(conversation.id);
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }

      return { error: "Unknown error occured when sending message" };
    }

    return redirect(303, "/");
  },
  editConversationName: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    const name = formData.get("name");

    try {
      if (typeof name !== "string") {
        throw new Error(`Invalid name`);
      }

      if (name.length === 0) {
        throw new Error(`Invalid name`);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      if (conversation.name === name) {
        throw new Error(`Conversation name is the same`);
      }

      let isAdmin = conversation.admins.includes(authModel.id);

      if (!isAdmin) {
        throw new Error(`User is not admin`);
      }

      await conversationsCollection.update(conversation.id, {
        name,
      });
    } catch (error) {
      if (error instanceof Error) {
        return fail(500, { error: error.message });
      }

      return fail(500, { error: "Unknown error occured when sending message" });
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
  editConversationPhoto: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    const photo = formData.get("photo");

    try {
      if (!(photo instanceof File)) {
        throw new Error(`Invalid photo`);
      }

      if (photo.size === 0) {
        throw new Error(`Invalid photo`);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      console.log("let");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      let isAdmin = conversation.admins.includes(authModel.id);

      if (!isAdmin) {
        throw new Error(`User is not admin`);
      }

      await conversationsCollection.update(conversation.id, {
        photo,
      });
    } catch (error) {
      if (error instanceof Error) {
        return fail(500, { error: error.message });
      }

      return fail(500, { error: "Unknown error occured when sending message" });
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
  removeMessage: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    const messageId = formData.get("message-id");

    try {
      if (typeof messageId !== "string") {
        throw new Error(`Invalid message id`);
      }

      if (messageId.length === 0) {
        throw new Error(`Invalid message id`);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      let isAdmin = conversation.admins.includes(authModel.id);

      let messageFound = conversation.messages.find(
        (msg) => msg.id === messageId
      );

      const userDoesNotOwnMessage = !(
        messageFound && messageFound.user_id === authModel.id
      );

      if (!isAdmin && userDoesNotOwnMessage) {
        throw new Error(
          `User does not have the permission to remove this message`
        );
      }

      let isImage = false;
      let imageURL = "";

      let messages = conversation.messages.filter((msg) => {
        const equals = msg.id !== messageId;

        if (!equals) {
          isImage = msg.contentType === "image";
          imageURL = msg.content;
        }

        return equals;
      });

      if (isImage) {
        await conversationsCollection.update(conversation.id, {
          messages,
          "message_photos-": [imageURL],
        });
      } else {
        await conversationsCollection.update(conversation.id, {
          messages,
        });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return fail(500, { error: error.message });
      }

      return fail(500, { error: "Unknown error occured when sending message" });
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
  removeMember: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    const userID = formData.get("user-id");

    let redirectHome = false;

    try {
      if (typeof userID !== "string") {
        throw new Error(`Invalid user id`);
      }

      if (userID.length === 0) {
        throw new Error(`Invalid user id`);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      let isAdmin = conversation.admins.includes(authModel.id);

      if (!isAdmin) {
        throw new Error(`User is not an admin`);
      }

      let members = conversation.members.filter((member) => member !== userID);

      if (members.length === 1) {
        await conversationsCollection.delete(conversation.id);

        redirectHome = true;
      } else {
        await conversationsCollection.update(conversation.id, {
          members,
        });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return fail(500, { error: error.message });
      }

      return fail(500, { error: "Unknown error occured when sending message" });
    }

    if (redirectHome) {
      throw redirect(303, "/");
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
  addMembers: async ({ locals, request, params }) => {
    const authModel = locals.pocketBase.authStore.model;

    if (!authModel || !validateUser(authModel)) {
      throw redirect(303, "/signup");
    }

    const formData = await request.formData();

    try {
      const unparsedMembers = formData.get("members");

      if (typeof unparsedMembers !== "string") {
        throw new Error(`Invalid members`);
      }

      const members = JSON.parse(unparsedMembers);

      if (!Array.isArray(members)) {
        throw new Error(`Invalid members`);
      }

      if (members.length > 3) {
        throw new Error(`Invalid members`);
      }

      let validatedMembers: string[] = [];

      for (let member of members) {
        if (typeof member !== "string") {
          throw new Error(`Invalid item in members array`);
        }

        validatedMembers.push(member);
      }

      const conversationsCollection =
        locals.pocketBase.collection("conversations");

      let conversation: (RecordModel & Conversation) | undefined =
        await conversationsCollection.getOne(params.conversation_id);

      if (!conversation) {
        throw new Error(`Conversation not found`);
      }

      let isAdmin = conversation.admins.includes(authModel.id);

      if (!isAdmin) {
        throw new Error(`User does not have the permission to add members`);
      }

      let tooMuchMembersInTotal =
        conversation.members.length + validatedMembers.length > 5;

      if (tooMuchMembersInTotal) {
        throw new Error(`A conversation can have 5 members in total`);
      }

      let duplicateMember = members.reduce((previous: boolean, current) => {
        if (previous) {
          return previous;
        }

        return conversation!.members.includes(current);
      }, false);

      if (duplicateMember) {
        throw new Error(
          `Cannot add member because member is already in the conversation`
        );
      }

      await conversationsCollection.update(conversation.id, {
        members: [...conversation.members, ...validatedMembers],
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return fail(500, { error: error.message });
      }

      return fail(500, { error: "Unknown error occured when sending message" });
    }

    throw redirect(303, `/${params.conversation_id}`);
  },
};
