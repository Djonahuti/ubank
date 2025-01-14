'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn = async (data: any) => {
    try {
        // Mutation / Database Modification / Make Fetch Request
    } catch (error) {
        console.error('Error signing in', error);
    }
}

export const signUp = async (userData: SignUpParams) => {
    const { firstName, lastName, email, password } = userData;

    try {
        const { account } = await createAdminClient();

        const newUserAccount = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount);
    } catch (error) {
        console.error('Error signing up', error);
    }
}


export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user = await account.get();

      return parseStringify(user);
    } catch (error) {
      return null;
    }
  }
  