'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";

export const signIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();

        const response = await account.createEmailPasswordSession(email, password);

        return parseStringify(response);
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
  
  export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();

        cookies().delete("appwrite-session");

        await account.deleteSession('current');
    } catch (error) {
        return null;
    }
  }

  export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: user.name,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({linkToken: response.data.link_token});
    } catch (error) {
        console.log(error);
    }
  }

  export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        // Exchange public Token for access token and item ID
       const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
       });
       
       const accessToken = response.data.access_token;
       const itemId = response.data.item_id;

       // Get account information from Plaid using the access token
       const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
       });

       const accountData = accountsResponse.data.accounts[0];

       const request: ProcessorTokenCreateRequest = {
        access_token: accessToken,
        account_id: accountData.account_id,
        processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
       };

       const processorTokenResponse = await plaidClient.processorTokenCreate(request);
       const processorToken = processorTokenResponse.data.processor_token;

       // Create a Funding source URL for the account using the dwolla customer ID, processor token, and bank name
       const fundingSourceUrl = await addFundingSource({
        dwollaCustomerId: user.dwollaCustomerId,
        processorToken,
        bankName: accountData.name,
       });

       // if the funding source URL is not created throw an error
       if (!fundingSourceUrl) throw Error;

       // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and sharable ID
       await createBankAccount({
        userId: user.$id,
        bankId: itemId,
        accountId: accountData.account_id,
        accessToken,
        fundingSourceUrl,
        sharableId: encryptId(accountData.account_id),
       });

       // Revalidate the path to reflect the changes
       revalidatePath('/');

       // Return a success message
       return parseStringify({
        publicTokenExchnge: "complete",
       });
    } catch (error) {
        console.error("An error occurred while creating exchanging token:", error);       
    }
  }
