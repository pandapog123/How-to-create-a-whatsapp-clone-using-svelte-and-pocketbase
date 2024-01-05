import PocketBase, { type RecordModel } from "pocketbase";
import { browser } from "$app/environment";
import { derived, get, writable } from "svelte/store";
import { validateUser, type Conversation, type User } from "./types";

export const pb = writable<PocketBase | undefined>(undefined, (set) => {
  if (!browser) {
    return;
  }

  const pocketbaseInstance = new PocketBase("http://localhost:8090");

  pocketbaseInstance.authStore.loadFromCookie(document.cookie);

  set(pocketbaseInstance);
});

export const userStore = derived<[typeof pb], User | undefined>(
  [pb],
  ([pb], set) => {
    if (!pb || !browser) {
      set(undefined);

      return;
    }

    const authModel = pb.authStore.model;

    if (!validateUser(authModel)) {
      set(undefined);

      return;
    }

    const collectionUnsubscribe = pb
      .collection("users")
      .subscribe(authModel.id, (e) => {
        if (e.action === "delete") {
          pb.authStore.clear();
          set(undefined);
        } else {
          pb.authStore.save(pb.authStore.token, e.record);

          const authModel = pb.authStore.model;

          if (!validateUser(authModel)) {
            set(undefined);
          } else {
            set(authModel);
          }
        }
      });

    return async () => {
      (await collectionUnsubscribe)();
    };
  }
);

export const conversationsStore = derived<
  [typeof pb],
  (Conversation & RecordModel)[] | undefined
>([pb], ([pb], set, update) => {
  if (!browser || !pb) {
    set(undefined);

    return;
  }

  const authModel = pb.authStore.model;

  if (!validateUser(authModel)) {
    set(undefined);

    return;
  }

  const conversationCollection = pb.collection<RecordModel & Conversation>(
    "conversations"
  );

  conversationCollection
    .getFullList({
      sort: "-created",
    })
    .then((data) => {
      set(data);
    });

  conversationCollection.subscribe("*", (data) => {
    switch (data.action) {
      case "create":
        update((previousConversations) => [
          data.record,
          ...(previousConversations ?? []),
        ]);
        break;
      case "delete":
        update((previousConversations) =>
          (previousConversations ?? []).filter(
            (conversation) => conversation.id !== data.record.id
          )
        );
        break;

      case "update":
        update((previousConversations) => {
          const conversationFound = (previousConversations ?? []).find(
            (conversation) => conversation.id === data.record.id
          );

          if (!(conversationFound && previousConversations)) {
            return previousConversations;
          }

          return previousConversations.map((conversation) => {
            if (conversation.id === data.record.id) {
              return data.record;
            }
            return conversation;
          });
        });
        break;
    }
  });
});

export const cachedUsers = derived<
  [typeof pb, typeof conversationsStore],
  { [id: string]: User }
>([pb, conversationsStore], ([pb, conversations], set, update) => {
  if (!get(cachedUsers)) {
    set({});
  }

  if (!conversations || !pb) {
    set({});

    return;
  }

  const authModel = pb.authStore.model;

  if (!authModel) {
    set({});

    return;
  }

  let previousUsers = get(cachedUsers);

  const userIDSResult = getUserIDS(previousUsers, conversations, authModel.id);

  const userIDS = userIDSResult.result;

  if (userIDSResult.equal) {
    return;
  }

  const usersQuery = userIDS.reduce<string>((previousValue, currentUser) => {
    const queryString = `id = "${currentUser}"`;

    if (previousValue === "") {
      return queryString;
    }

    return `${previousValue} || ${queryString}`;
  }, "");

  pb.collection<User & RecordModel>("users")
    .getFullList({ filter: usersQuery })
    .then((result) => {
      update((previousUsers) => {
        const newUsers = result.reduce<{ [id: string]: User }>(
          (previousValue, currentUser) => {
            previousValue[currentUser.id] = currentUser;

            return previousValue;
          },
          {}
        );

        if (!previousUsers) {
          return newUsers;
        }

        return { ...previousUsers, ...newUsers };
      });
    });
});

function getUserIDS(
  previousUsers: { [id: string]: User },
  conversations: (Conversation & RecordModel)[],
  userID: string
) {
  let equal = true;

  const result = conversations.reduce<string[]>(
    (previousValue, currentConversation) => {
      for (const member of currentConversation.members) {
        if (
          !previousValue.includes(member) &&
          !previousUsers[member] &&
          member !== userID
        ) {
          previousValue.push(member);
          equal = false;
        }
      }

      return previousValue;
    },
    []
  );

  return { result, equal };
}
