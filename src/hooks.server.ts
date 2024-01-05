import { pb } from "$lib/pocketbase";
import PocketBase from "pocketbase";

export const handle = async ({ event, resolve }) => {
  event.locals.pocketBase = new PocketBase("http://127.0.0.1:8090");

  try {
    event.locals.pocketBase.authStore.loadFromCookie(
      event.request.headers.get("cookie") ?? ""
    );

    await event.locals.pocketBase.collection("users").authRefresh();
  } catch (error) {
    event.locals.pocketBase.authStore.clear();
  }

  pb.set(event.locals.pocketBase);

  const response = await resolve(event);

  response.headers.set(
    "set-cookie",
    event.locals.pocketBase.authStore.exportToCookie({
      sameSite: true,
      secure: false,
      httpOnly: false,
    })
  );

  return response;
};
