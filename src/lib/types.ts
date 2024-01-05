export type User = {
  id: string;
  email: string;
  name: string;
  photo?: string;
};

export function validateUser(data: any): data is User {
  const idIsString = typeof data.id === "string";
  const emailIsString = typeof data.email === "string";
  const nameIsString = typeof data.name === "string";

  return idIsString && emailIsString && nameIsString;
}

export type Conversation = {
  name: string;
  photo?: string;
  members: string[];
  admins: string[];
  messages: Message[];
  message_photos?: string[];
};

export type Message = {
  user_id: string;
  id: string;
  content: string;
  contentType: "message" | "image";
  created: string;
};
